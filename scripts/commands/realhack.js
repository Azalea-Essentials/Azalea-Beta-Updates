export function addRealHackCommand(commands) {
    commands.addCommand("realhack", {
        description: "real hecking",
        category: "Useless",
        onRun(msg, args, theme, response, commands, prefix) {
            response(`TEXT ${Math.floor(Math.random() * (255 - 1 + 1) + 1)}.${Math.floor(Math.random() * (255 - 1 + 1) + 1)}.${Math.floor(Math.random() * (255 - 1 + 1) + 1)}.${Math.floor(Math.random() * (255 - 1 + 1) + 1)}`);
        }
    })
}