# Vitalis
Multi-tasks bot made by Neshell (AKA Aakodal). Successor of Luminis.
## Downloading
Just clone this repository. That's all.
## Prerequisites
### Node.JS
Before using Vitalis, you need to install [Node.JS](https://nodejs.org) on your computer. Please use a recent version of Node.JS (>= v12.X.X, v13 recommended). Also, you need windows-build-tools, so if Node.JS installer asks you if you want to install them, please, say yes.
### TypeScript
You may see that Vitalis is completly written in [TypeScript](https://www.typescriptlang.org/). However, TypeScript code is not executable. You first need to install the `typescript` module (version 3.8.3 minimum).

Then, at the bot's root, just make a wonderful `npm run build`; a folder named `build` will appear, and will contain the transpiled code in JavaScript! Hooray!
### Node modules
After compiling from TypeScript, go to your fresh `build` folder, and execute
```md
npm i
```
And *voilà*!
### Configuring
Edit your `config.json` in your `build` folder, and change the `token` and the `botOwner` values by your own. Don't forget to add the bot to your server ; it needs the "administrator" permission and needs to be high-placed in your roles.
## Using
### WARNING /!\\
Vitalis is **NOT** made for being used in more than one server (at least for now). Only one server per Vitalis instance.

After installing node modules, always in your `build` folder, just execute `npm run start` (or `node .` if you prefer). And that's it! Your bot is on!
