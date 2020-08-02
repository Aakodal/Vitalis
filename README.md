# Vitalis
Multi-tasks bot made by Neshell (AKA Aakodal). Successor of Luminis.
## Adding to your server
Simply use [this link](https://discord.com/api/oauth2/authorize?client_id=647787304550924300&permissions=2113797879&scope=bot).
## Hosting your own
### Node.JS
Before using Vitalis, you need to install [Node.JS](https://nodejs.org) on your computer. Please use a recent version of Node.JS (^12.0.0). Also, you will need [different tools to make node-gyp work](https://github.com/nodejs/node-gyp#installation), so please, install them.
### Node modules
You need to install the required modules; so, just make a nice
```
npm i
# or whatever you use as package manager
```
And *voilà*!
### Building
At the bot's root, just make a wonderful `npm run build`; a folder named `build` will appear, and will contain the transpiled code in JavaScript! Hooray!
### Configuring
Edit your `config.json` in your `build` folder, and change the `token` and the `botOwner` values by your own. Don't forget to add the bot to your server; it needs the same permissions as in its invite link and needs to be high-placed in your roles.
## Using
After installing node modules, always in your `build` folder, just execute the `start` script (with npm with `npm start` or whatever). And that's it! Your bot is on!
