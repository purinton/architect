// Command handler for /clear
export default async function ({ client, log, msg, db }, interaction) {
    try {
        if (!interaction.member?.permissions?.has('ADMINISTRATOR')) {
            const content = msg('permissions_error', 'This command requires **Administrator** permissions to execute.');
            await interaction.reply({ content, flags: 1 << 6, });
            return;
        }

        const appId = client.user.id;
        const guildId = interaction.guild.id;
        const channelId = interaction.channel.id;

        await db.query(
            'DELETE FROM channels WHERE app_id = ? AND guild_id = ? AND channel_id = ?',
            [appId, guildId, channelId]
        );

        const content = msg('cleared', "The internal chat history in this channel has been cleared.");
        await interaction.reply({ content });
    } catch (err) {
        log.error("Error in /clear handler", err);
        try {
            const content = msg('error', 'An error occurred while processing your request. Please try again later.');
            await interaction.reply({ content, flags: 1 << 6 });
        } catch (e) {
            log.error("Failed to reply with error message", e);
        }
    }
}
