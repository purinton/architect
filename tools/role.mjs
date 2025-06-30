import { z, buildResponse } from '@purinton/mcp-server';
import { PermissionsBitField } from 'discord.js';

const roleSettingsSchema = z.object({
  name: z.string().optional(),
  color: z.union([z.string(), z.number()]).optional(),
  hoist: z.boolean().optional(),
  position: z.number().optional(),
  permissions: z.array(z.string())
    .optional()
    .describe(
      "Permissions to set, specified as an array of permission names (e.g. ['VIEW_CHANNEL','SEND_MESSAGES'])."
    ),
  mentionable: z.boolean().optional(),
});

const memberRoleSchema = z.object({
  memberId: z.union([z.string(), z.array(z.string())]),
  roleId: z.union([z.string(), z.array(z.string())]),
});

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Create, list, get, update, delete roles, and add/remove role(s) from member(s).',
    {
      guildId: z.string().optional(),
      roleId: z.union([z.string(), z.array(z.string())]).optional(),
      method: z.enum(['create', 'list', 'get', 'update', 'delete', 'addToMember', 'removeFromMember']),
      roleSettings: z.union([roleSettingsSchema, z.array(roleSettingsSchema)]).nullable().optional(),
      memberRole: memberRoleSchema.nullable().optional(),
    },
    async (_args, _extra) => {
      try {
        log.debug(`[${toolName}] Request`, { _args });
        const { guildId, roleId, method, roleSettings, memberRole } = _args;
        const roleIds = method === 'create' ? [] : Array.isArray(roleId) ? roleId.filter(Boolean) : roleId ? [roleId].filter(Boolean) : [];
        let settingsArr = Array.isArray(roleSettings) ? roleSettings : roleSettings ? [roleSettings] : [];
        if (method === 'create') {
          settingsArr = settingsArr.filter(s => s && typeof s.name === 'string' && s.name.trim());
          log.debug(`[${toolName}] Final settingsArr for create`, { settingsArr });
          if (!guildId || !settingsArr.length) {
            log.error(`[${toolName}] guildId and valid roleSettings (with name) required for create.`);
            return buildResponse({ error: 'guildId and valid roleSettings (with name) required for create.' });
          }
          const guild = discord.guilds.cache.get(guildId);
          if (!guild) {
            log.error(`[${toolName}] Guild not found.`, { guildId });
            return buildResponse({ error: 'Guild not found.' });
          }
          const results = [];
          for (const settings of settingsArr) {
            const opts = { ...settings };
            if (Array.isArray(opts.permissions)) {
              opts.permissions = PermissionsBitField.resolve(opts.permissions);
            } else {
              delete opts.permissions;
            }
            const created = await guild.roles.create(opts);
            log.debug(`[${toolName}] Role created`, { id: created.id });
            results.push({ created: true, id: created.id, name: created.name });
          }
          return buildResponse({ results });
        } else if (method === 'list') {
          if (!guildId) {
            log.error(`[${toolName}] guildId required for list.`);
            return buildResponse({ error: 'guildId required for list.' });
          }
          const guild = discord.guilds.cache.get(guildId);
          if (!guild) {
            log.error(`[${toolName}] Guild not found.`, { guildId });
            return buildResponse({ error: 'Guild not found.' });
          }
          const roles = guild.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.color, position: r.position }));
          log.debug(`[${toolName}] Roles listed`, { count: roles.length });
          return buildResponse({ roles });
        } else if (method === 'get') {
          if (!roleIds.length) {
            log.error(`[${toolName}] roleId(s) required for get.`);
            return buildResponse({ error: 'roleId(s) required for get.' });
          }
          const results = roleIds.map(rid => {
            const role = discord.roles?.cache?.get(rid) || discord.guilds.cache.map(g => g.roles.cache.get(rid)).find(Boolean);
            if (!role) return { error: 'Role not found', id: rid };
            log.debug(`[${toolName}] Role found`, { id: role.id });
            return {
              id: role.id,
              name: role.name,
              permissions: role.permissions?.toArray ? role.permissions.toArray() : [],
              color: role.color,
              hoist: role.hoist,
              position: role.position,
              mentionable: role.mentionable,
            };
          });
          return buildResponse({ results });
        } else if (method === 'update') {
          if (!roleIds.length || !settingsArr.length) {
            log.error(`[${toolName}] roleId(s) and roleSettings required for update.`);
            return buildResponse({ error: 'roleId(s) and roleSettings required for update.' });
          }
          const results = [];
          for (let i = 0; i < roleIds.length; i++) {
            const rid = roleIds[i];
            const settings = settingsArr[i] || settingsArr[0];
            const role = discord.roles?.cache?.get(rid) || discord.guilds.cache.map(g => g.roles.cache.get(rid)).find(Boolean);
            if (!role) {
              results.push({ error: 'Role not found', id: rid });
              continue;
            }
            // convert permissions array of names to bitfield number
            const opts = Object.fromEntries(
              Object.entries(settings).filter(([_, v]) => v !== undefined && v !== null)
            );
            if (Array.isArray(opts.permissions)) {
              opts.permissions = PermissionsBitField.resolve(opts.permissions);
            } else {
              delete opts.permissions;
            }
            await role.edit(opts);
            log.debug(`[${toolName}] Role updated`, { id: role.id });
            results.push({ updated: true, id: role.id });
          }
          return buildResponse({ results });
        } else if (method === 'delete') {
          if (!roleIds.length) {
            log.error(`[${toolName}] roleId(s) required for delete.`);
            return buildResponse({ error: 'roleId(s) required for delete.' });
          }
          const results = [];
          for (const rid of roleIds) {
            const role = discord.roles?.cache?.get(rid) || discord.guilds.cache.map(g => g.roles.cache.get(rid)).find(Boolean);
            if (!role) {
              results.push({ error: 'Role not found', id: rid });
              continue;
            }
            await role.delete();
            log.debug(`[${toolName}] Role deleted`, { id: rid });
            results.push({ deleted: true, id: rid });
          }
          return buildResponse({ results });
        } else if (method === 'addToMember' || method === 'removeFromMember') {
          if (!guildId || !memberRole) {
            log.error(`[${toolName}] guildId and memberRole required for ${method}.`);
            return buildResponse({ error: 'guildId and memberRole required.' });
          }
          const guild = discord.guilds.cache.get(guildId);
          if (!guild) {
            log.error(`[${toolName}] Guild not found.`, { guildId });
            return buildResponse({ error: 'Guild not found.' });
          }
          const memberIds = Array.isArray(memberRole.memberId) ? memberRole.memberId : [memberRole.memberId];
          const roleIdsArr = Array.isArray(memberRole.roleId) ? memberRole.roleId : [memberRole.roleId];
          const results = [];
          for (const memberId of memberIds) {
            const member = guild.members.cache.get(memberId);
            if (!member) {
              results.push({ error: 'Member not found', memberId });
              continue;
            }
            for (const rid of roleIdsArr) {
              if (method === 'addToMember') {
                await member.roles.add(rid);
                log.debug(`[${toolName}] Role added to member`, { memberId, rid });
                results.push({ added: true, memberId, roleId: rid });
              } else {
                await member.roles.remove(rid);
                log.debug(`[${toolName}] Role removed from member`, { memberId, rid });
                results.push({ removed: true, memberId, roleId: rid });
              }
            }
          }
          return buildResponse({ results });
        } else {
          log.error(`[${toolName}] Invalid method.`, { method });
          return buildResponse({ error: 'Invalid method.' });
        }
      } catch (err) {
        return buildResponse({ error: err?.message || String(err) });
      }
    }
  );
}
