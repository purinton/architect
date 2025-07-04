import { jest } from '@jest/globals';
import eventTool from '../../../tools/event.mjs';

describe('event tool - unknown method', () => {
  it('registers tool and handles unknown method', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map([['g', { scheduledEvents: { cache: new Map() } }]]) } };
    await eventTool({ mcpServer, toolName: 'event', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const result = await handler({ guildId: 'g', method: 'invalid' }, {});
    expect(result).toHaveProperty('content');
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty('text');
    const errorObj = JSON.parse(result.content[0].text);
    expect(errorObj).toMatchObject({ error: 'Unknown method: invalid' });
  });
});
