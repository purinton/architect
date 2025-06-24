import log from '../log.mjs';
import { getMsg } from '../locales.mjs';
import { delKey } from '../custom/redis.mjs';

// Command handler for /clear
export default async function (interaction) {
    try {
        if (!interaction.member?.permissions?.has('ADMINISTRATOR')) {
            const errMsg = getMsg(interaction.locale, "permissions_error", "This command requires **Administrator** permissions to execute.");
            await interaction.reply({
                content: errMsg,
                flags: 1 << 6, // EPHEMERAL
            });
            return;
        }
        await delKey(interaction.channel.id);
        const msgContent = getMsg(interaction.locale, "cleared", "The internal chat history in this channel has been cleared.");
        await interaction.reply({ content: msgContent });
    } catch (err) {
        log.error("Error in /clear handler", err);
        try {
            await interaction.reply({
                content: getMsg(interaction.locale, "error", "An error occurred while processing your request. Please try again later."),
                flags: 1 << 6,
            });
        } catch (e) {
            log.error("Failed to reply with error message", e);
        }
    }
}
