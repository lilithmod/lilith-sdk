#!/usr/bin/env node

import DependencyWalker from "./DependencyWalker";
import ModConfig from "./types/ModConfig";
import { dir, file } from "tmp-promise";
import Dependency from "./Dependency";
import archiver from "archiver";
import crypto from "crypto";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import os from "os";

const clonedDependencyPaths: string[] = [];
const integrityHashes: { [key: string]: string } = {};
const ignoreFiles = ["node_modules", "package-lock.json", "package.json", "dist", "mod.json", ".git"];

async function mergeDefaultConfig(config: ModConfig): Promise<ModConfig> {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const defaults: ModConfig = {
        entry: packageJson.main ?? "./index.js",
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        author: packageJson.author
    }

    return Object.assign(defaults, config);
}

function cloneDirectory(source: string, destination: string) {
    const files = fs.readdirSync(source);

    files.forEach(file => {
        const sourceFile = path.join(source, file);
        const destinationFile = path.join(destination, file);

        if (fs.lstatSync(sourceFile).isDirectory()) {
            fs.mkdirSync(destinationFile);
            cloneDirectory(sourceFile, destinationFile);
        } else {
            fs.copyFileSync(sourceFile, destinationFile);
        }
    });
}

function cloneDependency(dependency: Dependency, destination: string) {
    const files = fs.readdirSync(dependency.path);

    if (!clonedDependencyPaths.includes(dependency.path)) {
        fs.mkdirSync(path.join(destination, dependency.path), { recursive: true });

        files.forEach(file => {
            if (file !== "node_modules") {
                const sourceFile = path.join(dependency.path, file);
                const destinationFile = path.join(destination, dependency.path, file);

                if (fs.lstatSync(sourceFile).isDirectory()) {
                    fs.mkdirSync(destinationFile, { recursive: true });
                    cloneDirectory(sourceFile, destinationFile);
                } else {
                    fs.copyFileSync(sourceFile, destinationFile);
                }
            }
        });

        clonedDependencyPaths.push(dependency.path);
    }

    for (const dep of dependency.dependencies) {
        cloneDependency(dep, destination);
    }
}

function deleteDir(dir: string) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        if (fs.lstatSync(filePath).isDirectory()) {
            deleteDir(filePath);
        } else {
            fs.unlinkSync(filePath);
        }
    }

    fs.rmdirSync(dir);
}

function countFiles(dir: string) {
    let totalFiles = 0;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        if (fs.lstatSync(filePath).isDirectory()) {
            totalFiles += countFiles(filePath) + 1;
        } else {
            totalFiles++;
        }
    }

    return totalFiles;
}

function getIntegrityHashes(rootDir: string, dir = rootDir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        if (fs.lstatSync(filePath).isDirectory()) {
            getIntegrityHashes(rootDir, filePath);
        } else {
            const hash = crypto.createHash("sha256");

            process.stdout.cursorTo(0);
            process.stdout.clearLine(0);
            process.stdout.write(`${chalk.magentaBright("Integrity")} ${chalk.gray("||")} Generating hash for ${path.relative(rootDir, filePath)}`);

            integrityHashes[path.relative(rootDir, filePath)] = hash.update(fs.readFileSync(filePath)).digest("hex");
        }
    }
}

function generateModData(config: ModConfig, dir: string) {
    console.log(`${chalk.magentaBright("Integrity")} ${chalk.gray("||")} Generating hashes`);
    getIntegrityHashes(dir);
    process.stdout.cursorTo(0);
    process.stdout.clearLine(0);
    console.log(`${chalk.magentaBright("Integrity")} ${chalk.gray("||")} Generated hashes`);
    console.log(`${chalk.green("Config")} ${chalk.gray("||")} Configuring mod`);

    const output = {
        name: config.name,
        version: config.version,
        description: config.description,
        entry: config.entry,
        sdkVersion: "1.0.0-alpha.1",
        integrity: integrityHashes,
        dependencies: config.dependencies ?? {}
    };

    fs.writeFileSync(path.join(dir, "mod.json"), JSON.stringify(output, null, 4));
}

async function main() {
    const configPath = path.join(process.cwd(), "mod.json");

    let config: ModConfig;

    if (!fs.existsSync(configPath)) {
        console.error(`${chalk.yellow("Warn")} ${chalk.gray("||")} mod.json not found in current directory, using default config`);
        config = await mergeDefaultConfig({});
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        console.log(`${chalk.green("Config")} ${chalk.gray("||")} mod.json created with default config`);
    } else {
        config = await mergeDefaultConfig(JSON.parse(fs.readFileSync(configPath, "utf8")));
        console.log(`${chalk.green("Config")} ${chalk.gray("||")} Loaded config`);
    }

    ignoreFiles.push(...(config.ignore ?? []));

    const dependencyWalker = new DependencyWalker();
    const dependencies = dependencyWalker.dependencies;
    const lilithDir = path.join(os.homedir(), "lilith");

    const { path: dirPath } = await dir();

    console.log(`${chalk.magenta("Copy")} ${chalk.gray("||")} Copying dependencies`);

    for (const dependency of dependencies) {
        cloneDependency(dependency, dirPath);
    }

    const files = fs.readdirSync(process.cwd())

    console.log(`${chalk.magenta("Copy")} ${chalk.gray("||")} Copying files`);

    for (const file of files) {
        if (!ignoreFiles.includes(file)) {
            const sourceFile = path.join(process.cwd(), file);
            const destinationFile = path.join(dirPath, file);

            if (fs.lstatSync(sourceFile).isDirectory()) {
                fs.mkdirSync(destinationFile, { recursive: true });
                cloneDirectory(sourceFile, destinationFile);
            } else {
                fs.copyFileSync(sourceFile, destinationFile);
            }
        }
    }

    generateModData(config, dirPath);

    console.log(`${chalk.blue("Package")} ${chalk.gray("||")} Beginning package creation`);
    if (!fs.existsSync(path.join(process.cwd(), "dist"))) {
        fs.mkdirSync(path.join(process.cwd(), "dist"));
    }

    const totalFiles = countFiles(dirPath);
    const outputDir = path.join(process.cwd(), "dist");
    const outputFile = path.join(outputDir, `${config.name ?? "mod"}.lmod`);

    if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
    }

    const output = fs.createWriteStream(outputFile);
    const archive = archiver("zip", {
        zlib: { level: 9 }
    });
    let lastEntry = "";

    archive.on("entry", (entry) => {
        lastEntry = entry.name;
    });

    archive.on("progress", (progress) => {
        const percentage = ((progress.entries.processed / totalFiles) * 100).toFixed(2);
        process.stdout.cursorTo(0);
        process.stdout.clearLine(0);
        process.stdout.write(`${chalk.blue("Package")} ${chalk.gray("||")} Packaging: ${percentage}% (${progress.entries.processed}/${totalFiles}) ${path.relative(process.cwd(), lastEntry)}`);
    })
    archive.pipe(output);

    output.on("close", () => {
        process.stdout.cursorTo(0);
        process.stdout.clearLine(0);
        console.log(`${chalk.blue("Package")} ${chalk.gray("||")} Packaged to ${path.relative(process.cwd(), outputFile)} (${(archive.pointer() / 1024).toFixed(2)} KB)`);
        console.log(`${chalk.cyan("Install")} ${chalk.gray("||")} Installing to Lilith mods directory`);

        if (!fs.existsSync(path.join(lilithDir, "mods"))) {
            fs.mkdirSync(path.join(lilithDir, "mods"), { recursive: true });
        }

        fs.copyFileSync(outputFile, path.join(lilithDir, "mods/mod.lmod"));
        console.log(`${chalk.greenBright("Finalizing")} ${chalk.gray("||")} Cleaning up`);
        deleteDir(dirPath);
        console.log(`${chalk.greenBright("Finalizing")} ${chalk.gray("||")} Done.`)
    });

    archive.directory(dirPath, false);
    archive.finalize();
}

main();