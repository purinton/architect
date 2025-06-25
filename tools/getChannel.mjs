import { z, buildResponse } from '@purinton/mcp-server';
import { PermissionsBitField } from 'discord.js';

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Returns all details about a given channel, including all settings and permissions (not message history).',
    { guildId: z.string(), channelId: z.string() },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, channelId } = _args;
      const guild = await discord.guilds.fetch(guildId);
      const channel = await discord.channels.fetch(channelId);
      const base = {
        id: channel.id,
        guildId: channel.guildId,
        name: channel.name,
        type: channel.type,
        position: channel.rawPosition,
        parentId: channel.parentId,
        createdAt: channel.createdAt,
        topic: channel.topic,
        nsfw: channel.nsfw,
        bitrate: channel.bitrate,
        userLimit: channel.userLimit,
        rateLimitPerUser: channel.rateLimitPerUser,
        lastPinTimestamp: channel.lastPinAt || channel.lastPinTimestamp,
        lastMessageId: channel.lastMessageId,
        archived: channel.archived,
        locked: channel.locked,
        defaultAutoArchiveDuration: channel.defaultAutoArchiveDuration,
        flags: channel.flags ? channel.flags.toArray?.() : undefined,
        isAnnouncementChannel: channel.type === 5,
        hideInactivityAfter: channel.defaultAutoArchiveDuration ? ({
          60: '1h',
          1440: '24h',
          4320: '3d',
          10080: '1w',
        }[channel.defaultAutoArchiveDuration] || channel.defaultAutoArchiveDuration + 'm') : undefined,
      };
      let permissionOverwrites = [];
      if (channel.permissionOverwrites && channel.permissionOverwrites.cache) {
        permissionOverwrites = await Promise.all(Array.from(channel.permissionOverwrites.cache.values()).map(async po => {
          let name = po.id;
          if (po.type === 0) { // role
            const role = guild.roles.cache.get(po.id);
            if (role) name = `${role.name}`;
          } else if (po.type === 1) { // member/user
            const member = await guild.members.fetch(po.id).catch(() => null);
            if (member) name = `${member.user.username}#${member.user.discriminator}`;
          }
          const allPerms = Object.keys(PermissionsBitField.Flags);
          const allow = BigInt(po.allow?.bitfield?.toString() || po.allow?.toString() || '0');
          const deny = BigInt(po.deny?.bitfield?.toString() || po.deny?.toString() || '0');
          const permissions = {};
          allPerms.forEach(perm => {
            const bit = BigInt(PermissionsBitField.Flags[perm]);
            if ((allow & bit) === bit) {
              permissions[perm] = 'allowed';
            } else if ((deny & bit) === bit) {
              permissions[perm] = 'denied';
            }
          });
          return {
            id: po.id,
            type: po.type === 0 ? 'role' : 'member',
            name,
            permissions
          };
        }));
      }
      base.permissionOverwrites = permissionOverwrites;
      let invites = [];
      if (typeof channel.fetchInvites === 'function') {
        try {
          const fetched = await channel.fetchInvites();
          invites = Array.from(fetched.values()).map(inv => ({
            code: inv.code,
            inviter: inv.inviter ? `${inv.inviter.username}#${inv.inviter.discriminator}` : undefined,
            uses: inv.uses,
            maxUses: inv.maxUses,
            maxAge: inv.maxAge,
            temporary: inv.temporary,
            createdAt: inv.createdAt,
            expiresAt: inv.expiresAt,
            url: inv.url
          }));
        } catch (e) {
          invites = [{ error: e.message }];
        }
      }
      let integrations = [];
      if (typeof guild.fetchIntegrations === 'function') {
        try {
          const fetched = await guild.fetchIntegrations();
          integrations = Array.from(fetched.values()).filter(i => i.channel && i.channel.id === channel.id).map(i => ({
            id: i.id,
            name: i.name,
            type: i.type,
            enabled: i.enabled,
            syncing: i.syncing,
            role: i.role ? i.role.name : undefined,
            user: i.user ? `${i.user.username}#${i.user.discriminator}` : undefined,
          }));
        } catch (e) {
          integrations = [{ error: e.message }];
        }
      }
      let webhooks = [];
      if (typeof channel.fetchWebhooks === 'function') {
        try {
          const fetched = await channel.fetchWebhooks();
          webhooks = Array.from(fetched.values()).map(wh => ({
            id: wh.id,
            name: wh.name,
            type: wh.type,
            url: wh.url,
            createdAt: wh.createdAt,
            creator: wh.owner ? `${wh.owner.username}#${wh.owner.discriminator}` : undefined,
            avatar: wh.avatar,
          }));
        } catch (e) {
          webhooks = [{ error: e.message }];
        }
      }
      integrations.push({ webhooks });
      let followedChannels = [];
      if (channel.type === 5 && guild.channels && guild.channels.cache) {
        followedChannels = Array.from(guild.channels.cache.values())
          .filter(ch => ch.followedChannel && ch.followedChannel.id === channel.id)
          .map(ch => ({
            id: ch.id,
            name: ch.name,
            type: ch.type,
          }));
      }
      if (followedChannels.length > 0) {
        integrations.push({ followedChannels });
      }
      base.integrations = integrations;
      const response = {
        id: channel.id,
        guildId: channel.guildId,
        name: channel.name,
        type: channel.type,
        position: channel.rawPosition,
        parentId: channel.parentId,
        createdAt: channel.createdAt,
        topic: channel.topic,
        nsfw: channel.nsfw,
        bitrate: channel.bitrate,
        userLimit: channel.userLimit,
        rateLimitPerUser: channel.rateLimitPerUser,
        lastPinTimestamp: channel.lastPinAt || channel.lastPinTimestamp,
        lastMessageId: channel.lastMessageId,
        archived: channel.archived,
        locked: channel.locked,
        defaultAutoArchiveDuration: channel.defaultAutoArchiveDuration,
        flags: channel.flags ? channel.flags.toArray?.() : undefined,
        isAnnouncementChannel: channel.type === 5,
        hideInactivityAfter: channel.defaultAutoArchiveDuration ? ({
          60: '1h',
          1440: '24h',
          4320: '3d',
          10080: '1w',
        }[channel.defaultAutoArchiveDuration] || channel.defaultAutoArchiveDuration + 'm') : undefined,
        permissionOverwrites,
        invites,
        integrations,
      };
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
