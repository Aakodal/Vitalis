import * as Discord from "discord.js";
import * as config from "./config.json";
const token: string = config.token;
import * as dateFns from "date-fns";
import * as fsModule from "fs";
import * as infos from "./package.json";
import { Client } from "./lib/Client";
import * as knex from "knex";
const fs: any = fsModule.promises;
const db: any = knex({
    client: "sqlite3",
    connection: {
        filename: "./db.db"
    },
    useNullAsDefault: true
});
const client: Client = new Client();

export { Discord, config, token, dateFns, fs, infos, db, client };