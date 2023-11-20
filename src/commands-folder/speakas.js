import { world } from '@minecraft/server';

import { beforeChat } from '../beforeChat';
import { CommandBuilder } from '../commandBuilder';

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

export default function() {
    new CommandBuilder("speakas")
        .desc("Speak as another player")
        .requiresAdmin(true)
        .category("Fun")
        .callback(({msg,args,theme,response})=>{
            let args2 = betterArgs(args.join(' '));
            let player;
            for(const player2 of world.getPlayers()) {
                if(player2.name.toLowerCase() == args2[0].toLowerCase()) {
                    player = player2;
                    break;
                }
            }
            if(!player) return response(`ERROR Player not found!`);
            beforeChat({
                cancel: true,
                sender: player,
                message: args2.slice(1).join(' ')
            })
        })
        .register()
}