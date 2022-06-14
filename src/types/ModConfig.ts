type ModConfig = {
    name?: string;
    entry?: string;
    version?: string;
    description?: string;
    author?: string;
    dependencies?: {
        [key: string]: string;
    },
    ignore?: string[];
}

export default ModConfig;