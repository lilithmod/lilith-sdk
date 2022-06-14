import Dependency from "./Dependency";
import process from "process";
import path from "path";
import fs from "fs";

export default class DependencyWalker {
    public dependencies: Dependency[];

    constructor() {
        this.dependencies = [];

        this.walk(".");
    }

    private resolve(pack: string, parent: string = ".") {
        let packagePath = path.join(parent, "node_modules", pack);

        if (fs.existsSync(path.join(process.cwd(), packagePath))) {
            return packagePath;
        } else {
            packagePath = path.join(".", "node_modules", pack);

            if (fs.existsSync(path.join(process.cwd(), packagePath))) {
                return packagePath;
            }
        }
    }

    public walk(pack: string, parent?: Dependency) {
        const packageJsonPath = path.join(process.cwd(), pack, "package.json");

        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

            if (packageJson.dependencies) {
                for (const dependency in packageJson.dependencies) {
                    const dependencyPath = this.resolve(dependency, pack);
                    if (dependencyPath) {
                        const dep = new Dependency(dependency, packageJson.dependencies[dependency], dependencyPath);

                        if (parent) {
                            parent.dependencies.push(dep);
                        } else {
                            this.dependencies.push(dep);
                        }

                        this.walk(dependencyPath, dep);
                    }
                }
            }
        }
    }
}