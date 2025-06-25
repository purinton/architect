// events/ready.mjs
export default async function ({ log, presence }, client) {
    log.debug('ready', { tag: client.user.tag });
    log.info(`Logged in as ${client.user.tag}`);
    if (presence) client.user.setPresence(presence);
    for (const guild of client.guilds.cache.values()) {
        try {
            await guild.members.fetch();
            log.info(`Fetched ${guild.memberCount} members of ${guild.name}`);
        } catch (err) {
            log.error(`Failed to fetch members for guild: ${guild.name}`, err);
        }
    }
    log.info(`Ready in ${client.guilds.cache.size} guilds with ${client.users.cache.size} users.`);
}
