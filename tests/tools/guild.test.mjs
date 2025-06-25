import { jest } from '@jest/globals';
import guildTool from '../../tools/guild.mjs';
describe('guild tool', () => {
  it('registers tool and handles invalid method', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map([['g', { id: 'g', name: 'guild', edit: jest.fn(), fetchAuditLogs: jest.fn(() => ({ entries: { size: 0, map: () => [] } })) }]]) } };
    await guildTool({ mcpServer, toolName: 'guild', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    await expect(handler({ guildId: 'g', method: 'invalid' }, {})).rejects.toThrow('Invalid method.');
  });
});
