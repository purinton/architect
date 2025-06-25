import { jest } from '@jest/globals';
import inviteTool from '../../tools/invite.mjs';
describe('invite tool', () => {
  it('registers tool and handles invalid method', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { channels: { cache: new Map([['c', { id: 'c', createInvite: jest.fn(), fetchInvites: jest.fn(() => []), send: jest.fn() }]]) }, fetchInvite: jest.fn(() => ({ delete: jest.fn() })) };
    await inviteTool({ mcpServer, toolName: 'invite', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    await expect(handler({ channelId: 'c', method: 'invalid' }, {})).rejects.toThrow('Invalid method.');
  });
});
