import fs from 'fs';
import path from 'path';

describe('All event handler files export a default function and match Discord Gateway event names', () => {
  const eventsDir = path.join(process.cwd(), 'events');
  const files = fs.readdirSync(eventsDir).filter(f => f.endsWith('.mjs'));
  // List of all valid Discord Gateway event names as of June 2025
  const validEvents = [
    'applicationCommandCreate', 'applicationCommandDelete', 'applicationCommandUpdate', 'channelCreate', 'channelDelete', 'channelPinsUpdate', 'channelUpdate', 'debug', 'emojiCreate', 'emojiDelete', 'emojiUpdate', 'error', 'guildBanAdd', 'guildBanRemove', 'guildCreate', 'guildDelete', 'guildIntegrationsUpdate', 'guildMemberAdd', 'guildMemberAvailable', 'guildMemberRemove', 'guildMembersChunk', 'guildMemberUpdate', 'guildScheduledEventCreate', 'guildScheduledEventDelete', 'guildScheduledEventUpdate', 'guildScheduledEventUserAdd', 'guildScheduledEventUserRemove', 'guildUnavailable', 'guildUpdate', 'interactionCreate', 'invalidated', 'inviteCreate', 'inviteDelete', 'messageBulkDelete', 'messageCreate', 'messageDelete', 'messageDeleteBulk', 'messageReactionAdd', 'messageReactionRemove', 'messageReactionRemoveAll', 'messageReactionRemoveEmoji', 'messageUpdate', 'presenceUpdate', 'rateLimit', 'ready', 'roleCreate', 'roleDelete', 'roleUpdate', 'shardDisconnect', 'shardError', 'shardReady', 'shardReconnecting', 'shardResume', 'stageInstanceCreate', 'stageInstanceDelete', 'stageInstanceUpdate', 'stickerCreate', 'stickerDelete', 'stickerUpdate', 'threadCreate', 'threadDelete', 'threadListSync', 'threadMembersUpdate', 'threadMemberUpdate', 'threadUpdate', 'typingStart', 'userUpdate', 'voiceStateUpdate', 'warn', 'webhookUpdate',
  ];
  const foundEvents = files.map(f => f.replace(/\.mjs$/, ''));

  for (const file of files) {
    const eventName = file.replace(/\.mjs$/, '');
    const filePath = path.join(eventsDir, file);
    test(`${file} exports a default function and is a valid Discord event`, async () => {
      expect(validEvents.includes(eventName)).toBe(true);
      const mod = await import(filePath);
      expect(typeof mod.default).toBe('function');
    });
  }

  // test('all valid Discord Gateway events have a handler file', () => {
  //   for (const event of validEvents) {
  //     expect(foundEvents).toContain(event);
  //   }
  // });
});
