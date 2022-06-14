# lilith-sdk

Lilith SDK contains types & a packager required for working with the Lilith modding API.

### Install

To install you can simply install via NPM
```
npm install lilith-sdk -g
```

### Usage

Using this is extremely simple, first create a mod

```js
const { versions, commandHandler } = require("lilith-sdk");

function onLoad() {
    console.log(`Using Lilith SDK version ${versions.sdk} with Lilith ${versions.lilith}`);

    commandHandler.registerCommand("hello_world", {
        execute: () => {
            console.log("Test command executed (wow)");
        }
    });
}

module.exports = {
    onLoad
}
```

then package it using `lilith-sdk` within your mod's directory

### Building

If you want to modify something about how this packages you can do so, simply run

```
npm install
npm run build
```
to get your built SDK