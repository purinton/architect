import { jest } from '@jest/globals';
import eventTool from '../../tools/event.mjs';
describe('event tool', () => {
  it('registers tool and handles invalid method', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map([['g', { scheduledEvents: { cache: new Map([['e', { id: 'e', name: 'ev', scheduledStartTime: 'now', edit: jest.fn(), delete: jest.fn() }]]), create: jest.fn(() => ({ id: 'e', name: 'ev' })) } }]]) } };
    await eventTool({ mcpServer, toolName: 'event', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    await expect(handler({ guildId: 'g', method: 'invalid' }, {})).rejects.toThrow('Invalid method.');
  });
});
