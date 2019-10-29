import { client } from "../requires"
import { getValueFromDB } from "./functions";

client.on("botPresenceUpdate", async () => {
    const status = await getValueFromDB("server", "status");
    const gameActive = await getValueFromDB("server", "gameActive");
    const gameType = await getValueFromDB("server", "gameType");
    const gameName = await getValueFromDB("server", "gameName");
    
    const prefix = await getValueFromDB("server", "prefix");

    const presence = {
        status: status ? status : "online",
        game: {
            name: gameName.replace("{PREFIX}", prefix),
            type: gameType
        }
    }

    
    if(gameActive) return client.user.setPresence(presence);
    client.user.setPresence({status: presence.status});
});