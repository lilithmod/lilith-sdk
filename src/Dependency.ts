export default class Dependency {
    public dependencies: Dependency[];

    constructor(public name: string, public version: string, public path: string) {
        this.dependencies = [];
    }
}