import { jest } from '@jest/globals';
import eventTool from '../../../tools/event.mjs';

describe('event tool - list', () => {
  it('returns error if guild not found', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map() } };
    await eventTool({ mcpServer, toolName: 'event', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const res = await handler({ guildId: 'x', method: 'list' }, {});
    const obj = JSON.parse(res.content[0].text);
    expect(obj).toMatchObject({ error: 'Guild not found.' });
  });
  it('returns events', async () => {
    const eventObj = { id: 'e', name: 'em', scheduledStartTime: '2025-01-01T00:00:00Z' };
    const guild = { scheduledEvents: { cache: { map: (fn) => [eventObj] } } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = await setup(discord);
    const res = await handler({ guildId: 'g', method: 'list' }, {});
    const obj = JSON.parse(res.content[0].text);
    expect(obj.events).toEqual([{ id: 'e', name: 'em', scheduledStartTime: '2025-01-01T00:00:00Z' }]);
  });
  async function setup(discord) {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await eventTool({ mcpServer, toolName: 'event', log, discord });
    return mcpServer.tool.mock.calls[0][3];
  }
});
