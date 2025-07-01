import { jest } from '@jest/globals';
import audit from '../../../tools/guild/audit.mjs';
describe('guild/audit', () => {
  it('fetches audit logs', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const fetchAuditLogs = jest.fn(() => ({ entries: { size: 1, map: jest.fn(() => [{ id: '1', action: 'ban' }]) } }));
    const discord = { guilds: { cache: new Map([['g', { fetchAuditLogs }]]) } };
    const result = await audit({ guildId: 'g', auditSettings: {}, log, discord, buildResponse, toolName: 'guild' });
    expect(fetchAuditLogs).toHaveBeenCalled();
    expect(result).toHaveProperty('entries');
  });
});
