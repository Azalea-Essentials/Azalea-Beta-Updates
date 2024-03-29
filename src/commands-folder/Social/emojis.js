import { CommandBuilder } from "../../commandBuilder";
import emojis from "../../emojis";

export default function() {
    new CommandBuilder("emojis")
        .desc("Lists emojis that can be used in chat and some other places")
        .category("Social")
        .callback(({msg,args,theme,response})=>{
            let text = [];
            for(const emoji of Object.keys(emojis)) {
                text.push(`:${emoji}: §7- ${emojis[emoji]}`);
            }
            response(`TEXT ${text.join('\n§r')}`)
        })
        .register();
}