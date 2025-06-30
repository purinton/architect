import { jest } from '@jest/globals';
import eventTool from '../../../tools/event.mjs';

describe('event tool - delete', () => {
  it('returns error if guild not found', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map() } };
    await eventTool({ mcpServer, toolName: 'event', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const res = await handler({ guildId: 'x', method: 'delete', eventId: 'e' }, {});
    const obj = JSON.parse(res.content[0].text);
    expect(obj).toMatchObject({ error: 'Guild not found.' });
  });
  it('errors without eventId', async () => {
    const guild = { scheduledEvents: { cache: new Map() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = await setup(discord);
    const res = await handler({ guildId: 'g', method: 'delete' }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ error: 'eventId required for delete.' });
  });
  it('errors when event not found', async () => {
    const guild = { scheduledEvents: { cache: new Map() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = await setup(discord);
    const res = await handler({ guildId: 'g', method: 'delete', eventId: 'x' }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ error: 'Event not found.' });
  });
  it('successfully deletes', async () => {
    const del = jest.fn();
    const event = { delete: del };
    const guild = { scheduledEvents: { cache: new Map([['e', event]]) } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = await setup(discord);
    const res = await handler({ guildId: 'g', method: 'delete', eventId: 'e' }, {});
    expect(del).toHaveBeenCalled();
    expect(JSON.parse(res.content[0].text)).toMatchObject({ deleted: true, id: 'e' });
  });
  async function setup(discord) {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await eventTool({ mcpServer, toolName: 'event', log, discord });
    return mcpServer.tool.mock.calls[0][3];
  }
});
