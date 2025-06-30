import { jest } from '@jest/globals';
import eventTool from '../../../tools/event.mjs';

describe('event tool - create', () => {
  it('returns error if guild not found', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map() } };
    await eventTool({ mcpServer, toolName: 'event', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const res = await handler({ guildId: 'x', method: 'create', eventSettings: { name: 'n', scheduledStartTime: '', entityType: 1, channelId: 'c', reason: '' } }, {});
    const obj = JSON.parse(res.content[0].text);
    expect(obj).toMatchObject({ error: 'Guild not found.' });
  });
  it('errors without required fields', async () => {
    const guild = { scheduledEvents: { create: jest.fn() }, channels: { cache: new Map() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = await setup(discord);
    const res = await handler({ guildId: 'g', method: 'create', eventSettings: {} }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ error: 'name, scheduledStartTime, and entityType required for create.' });
  });
  it('successfully creates', async () => {
    const eventObj = { id: 'e', name: 'em' };
    const mockChannel = { type: 2, isVoiceBased: () => true };
    const guild = { scheduledEvents: { create: jest.fn(async () => eventObj) }, channels: { cache: new Map([['c', mockChannel]]) } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = await setup(discord);
    const settings = { name: 'em', scheduledStartTime: '2025-01-01T00:00:00Z', scheduledEndTime: '2025-01-01T01:00:00Z', entityType: 2, channelId: 'c', reason: '' };
    const res = await handler({ guildId: 'g', method: 'create', eventSettings: settings }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ created: true, id: 'e', name: 'em' });
    expect(guild.scheduledEvents.create).toHaveBeenCalled();
  });
  async function setup(discord) {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await eventTool({ mcpServer, toolName: 'event', log, discord });
    return mcpServer.tool.mock.calls[0][3];
  }
});
