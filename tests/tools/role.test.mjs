import { jest } from '@jest/globals';
import roleTool from '../../tools/role.mjs';
describe('role tool', () => {
  it('registers tool and handles invalid method', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map([['g', { roles: { cache: new Map([['r', { id: 'r', name: 'role', edit: jest.fn(), delete: jest.fn() }]]), create: jest.fn(() => ({ id: 'r', name: 'role' })) }, members: { cache: new Map([['m', { roles: { add: jest.fn(), remove: jest.fn() } }]]) } }]]) }, roles: { cache: new Map([['r', { id: 'r', name: 'role', edit: jest.fn(), delete: jest.fn() }]]) } };
    await roleTool({ mcpServer, toolName: 'role', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    await expect(handler({ guildId: 'g', method: 'invalid' }, {})).rejects.toThrow('Invalid method.');
  });
});
