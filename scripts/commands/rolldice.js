export function addRollCommand(commands) {
    commands.addCommand("rolldice", {
        description: "Returns a random number 1 - 5",
        category: "Useless",
        onRun(msg, args, theme, response, commands, prefix) {
            response(`RESPONSE1 ${theme.infoColor}${Math.floor(Math.random() * 5) + 1}`);
        }
    })
}