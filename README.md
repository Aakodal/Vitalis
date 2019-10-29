# Vitalis
Multi-tasks bot made by Neshell. Successor of Luminis.
## Downloading
Just clone this repository. That's all.
## Prerequisites
### Node.JS
Before using Vitalis, you need to install [Node.JS](https://nodejs.org) on your computer. Please use a recent version of Node.JS; version 9 should be fine. Also, you need windows-build-tools, so if Node.JS installer asks you if you want to install them, please, say yes.
### TypeScript
You may see that Vitalis is completly written in [TypeScript](https://www.typescriptlang.org/). However, TypeScript code is not executable. You first need to download the typescript module:
```
npm i -g typescript
```
Then, at the bot's root, just make a wonderful `tsc`; a folder named `build` will appear, and will contain the transpiled code in JavaScript! Nice!
### Node modules
After "compiling" from TypeScript, go to your fresh `build` folder, and execute
```
npm i
```
And *voilà*!
### Configuring
Edit your `config.json` in your `build` folder, and change the `token` and the `botOwner` values by your own. Don't forget to add the bot to your server ; it needs the "administrator" permission and needs to be high-placed in your roles.
## Using
After installing node modules, always in your `build` folder, just execute `npm run start` (or `node main.js` if you prefer). And that's it! Your bot is on!