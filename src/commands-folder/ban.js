import {
  system,
  world,
} from '@minecraft/server';

import { Database } from '../db';
import { isAdmin } from '../isAdmin';
import moment from '../moment';

let cachedBans = [];
world.afterEvents.worldInitialize.subscribe(()=>{
    let bansDb = new Database("Bans");
    cachedBans = JSON.parse(bansDb.get("bans") ? bansDb.get("bans") : "[]");
})
world.afterEvents.playerSpawn.subscribe(eventData=>{
    // return;
    let ban = cachedBans.find(_=>eventData.player.id==_.playerId || eventData.player.name==_.playerName);
    let banIndex = cachedBans.findIndex(_=>eventData.player.id==_.playerId || eventData.player.name==_.playerName);
    if(ban) {
        console.warn(ban.expires, Date.now())
        if(ban.expires > 0 && Date.now() < ban.expires) {
            let player = eventData.player;
            system.run(()=>{
                player.runCommand(`kick "${player.name}" §cYou have been banned until ${moment(ban.expires).format('MMMM Do YYYY, h:mm:ss a')} UTC!\n\n§r§eYou can try contacting an admin to get unbanned if you think the ban wasnt fair`);
            })
            return;
        } else if(ban.expires > 0 && Date.now() > ban.expires) {
            cachedBans.splice(banIndex, 1);
            let bansDb = new Database("Bans");
            bansDb.set("bans", JSON.stringify(cachedBans));
        } else if(ban.expires == 0) {
            let player = eventData.player;
            system.run(()=>{
                player.runCommand(`kick "${player.name}" §cYou have been banned permanently!\n\n§r§eYou can try contacting an admin to get unbanned if you think the ban wasnt fair`);
            })
        }
        eventData.player.sendMessage("You are banned!");
    }
})
function MS(value, { compactDuration, fullDuration, avoidDuration } = {}) {
    try {
        if (typeof value === 'string') {
            if (/^\d+$/.test(value))
                return Number(value);
            const durations = value.match(/-?\d*\.?\d+\s*?(years?|yrs?|weeks?|days?|hours?|hrs?|minutes?|mins?|seconds?|secs?|milliseconds?|msecs?|ms|[smhdwy])/gi);
            return durations ? durations.reduce((a, b) => a + toMS(b), 0) : null;
        }
        ;
        if (typeof value === 'number')
            return toDuration(value, { compactDuration, fullDuration, avoidDuration });
        throw new Error('Value is not a string or a number');
    }
    catch (err) {
        const message = isError(err)
            ? `${err.message}. Value = ${JSON.stringify(value)}`
            : 'An unknown error has occured.';
        throw new Error(message);
    }
    ;
}
;
/**
 * Convert Durations to milliseconds
 */
function toMS(value) {
    const number = Number(value.replace(/[^-.0-9]+/g, ''));
    value = value.replace(/\s+/g, '');
    if (/\d+(?=y)/i.test(value))
        return number * 3.154e+10;
    else if (/\d+(?=w)/i.test(value))
        return number * 6.048e+8;
    else if (/\d+(?=d)/i.test(value))
        return number * 8.64e+7;
    else if (/\d+(?=h)/i.test(value))
        return number * 3.6e+6;
    else if (/\d+(?=m)/i.test(value))
        return number * 60000;
    else if (/\d+(?=s)/i.test(value))
        return number * 1000;
    else if (/\d+(?=ms|milliseconds?)/i.test(value))
        return number;
}
;
/**
 * Convert milliseconds to durations
 */
function toDuration(value, { compactDuration, fullDuration, avoidDuration } = {}) {
    const absMs = Math.abs(value);
    const duration = [
        { short: 'w', long: 'week', duration: Math.floor(absMs / 6.048e+8) },
        { short: 'd', long: 'day', duration: Math.floor(absMs / 8.64e+7) % 7 },
        { short: 'h', long: 'hour', duration: Math.floor(absMs / 3.6e+6) % 24 },
        { short: 'm', long: 'minute', duration: Math.floor(absMs / 60000) % 60 },
        { short: 's', long: 'second', duration: Math.floor(absMs / 1000) % 60 },
        { short: 'ms', long: 'millisecond', duration: absMs % 1000 }
    ];
    const mappedDuration = duration
        .filter(obj => obj.duration !== 0 && avoidDuration ? fullDuration && !avoidDuration.map(v => v.toLowerCase()).includes(obj.short) : obj.duration)
        .map(obj => `${Math.sign(value) === -1 ? '-' : ''}${compactDuration ? `${Math.floor(obj.duration)}${obj.short}` : `${Math.floor(obj.duration)} ${obj.long}${obj.duration === 1 ? '' : 's'}`}`);
    const result = fullDuration ? mappedDuration.join(compactDuration ? ' ' : ', ') : mappedDuration[0];
    return result || `${absMs}`;
}
;
/**
 * A type guard for errors.
 */
function isError(error) {
    return typeof error === 'object' && error !== null && 'message' in error;
}
;
function convertMillisecondsToTime(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  
    return `${hours}h ${minutes}m ${seconds}s`;
}
//The parenthesis in the regex creates a captured group within the quotes
function betterArgs(myString) {
    var myRegexp = /[^\s"]+|"([^"]*)"/gi;
    var myArray = [];
    
    do {
        //Each call to exec returns the next regex match as an array
        var match = myRegexp.exec(myString);
        if (match != null)
        {
            //Index 1 in the array is the captured group if it exists
            //Index 0 is the matched text, which we use if no captured group exists
            myArray.push(match[1] ? match[1] : match[0]);
        }
    } while (match != null);

    return myArray;
}
export default function banCommand(commands) {
    commands.addCommand("ban", {
        description: "Ban a player",
        admin: true,
        category: "Moderation",
        async onRun(msg, worseArgs, theme, response) {
            // if(!isAdmin(msg.sender)) return response(`ERROR You require admin to use this command!`);
            let args = betterArgs(worseArgs.join(' '));
            if(!args.length) return response(`ERROR You must include a player name. If the player you're trying to ban has spaces in their name, just add quotes around their name.`);
            let playerName = args[0];
            let player;
            for(const worldPlayer of world.getPlayers()) {
                if(worldPlayer.name.toLowerCase() == playerName.toLowerCase()) {
                    player = worldPlayer;
                    break;
                }
            }
            if(!player) return response(`ERROR Could not find player. Make sure the player you're trying to ban is online and if they have spaces in their username, put quotes around their name in the command.`);
            if(isAdmin(player)) return response(`ERROR Cant ban admins`);
            let bansDb = new Database("Bans");
            let bansList = JSON.parse(bansDb.get("bans") ? bansDb.get("bans") : "[]");
            let expiration = 0;
            let responseText = `Banned player permanently!`;
            if(args.length > 1) {
                let timeString = args[1];
                let milliseconds = toMS(timeString);
                if(milliseconds) {
                    responseText = `Banned player for ${convertMillisecondsToTime(milliseconds)}`;
                    expiration = Date.now()+milliseconds;
                } else {
                    return response(`ERROR Invalid time string.`);
                }
            }
            bansList.push({
                expires: expiration,
                playerId: player.id,
                playerName: player.name,
                bannedAt: Date.now()
            });
            let playerName2 = player.name;
            let text1 = `${moment(expiration).format('MMMM Do YYYY, h:mm:ss a')} UTC`;
            player.runCommand(`kick "${player.name}" \n§cYou have been banned${expiration > 0 ? ` until `+text1+`!` : ``}\n\n§r§eYou can try contacting an admin to get unbanned if you think the ban wasnt fair`);
            bansDb.set("bans", JSON.stringify(bansList));
            cachedBans = bansList;
            return response(`SUCCESS ${responseText}`);
        }
    })

    commands.addCommand("unban", {
        description: "Unban a player",
        admin: true,
        category: "Moderation",
        async onRun(msg, worseArgs, theme, response) {
            // if(!isAdmin(msg.sender)) return response(`ERROR You require admin to use this command!`);
            let args = betterArgs(worseArgs.join(' '));
            if(!args.length) return response(`ERROR You must include a player name. If the player you're trying to ban has spaces in their name, just add quotes around their name.`);
            let bansDb = new Database("Bans");
            let bansList = JSON.parse(bansDb.get("bans") ? bansDb.get("bans") : "[]");
            let expiration = 0;
            let responseText = `Unbanned player!`;
            let ban = bansList.find(_=>_.playerName.toLowerCase() == args[0].toLowerCase());
            let banIndex = bansList.find(_=>_.playerName.toLowerCase() == args[0].toLowerCase());
            if(ban) {
                bansList.splice(banIndex, 1);
            } else {
                return response(`ERROR Player not banned!`);
            }
            cachedBans = bansList;
            bansDb.set("bans", JSON.stringify(bansList));
            return response(`SUCCESS ${responseText}`);
        }
    })

    commands.addCommand('banlist', {
        description: "List all bans",
        admin: true,
        category: "Moderation",
        async onRun(msg, args, theme, response) {
            let bansDb = new Database("Bans");
            let bansList = JSON.parse(bansDb.get("bans") ? bansDb.get("bans") : "[]");
            cachedBans = bansList;

            let text = [`${theme.category}<-=- ${theme.command}Bans ${theme.category}-=->`];

            for(const ban of cachedBans) {
                let date = new Date(ban.expires);
                let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                let endStr = `${months[date.getMonth()]} ${date.getDate()}, ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                text.push(`${theme.command}${ban.playerName} ${theme.description}Expires ${ban.expires > 0 ? endStr : "Never"}`);
            }

            if(!cachedBans.length) text.push(`${theme.errorColor}There are no bans...`);

            response(`TEXT ${text.join('\n§r')}`)
        }
    })
}