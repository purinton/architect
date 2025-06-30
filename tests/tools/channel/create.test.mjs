import { jest } from '@jest/globals';
import channelTool from '../../../tools/channel.mjs';

describe('channel tool - create', () => {
  it('creates channels', async () => {
    const create = jest.fn(async (opts) => ({ id: 'new', name: opts.name }));
    const guild = { channels: { create } };
    const discord = {
      guilds: { cache: new Map([['g', guild]]) },
      channels: { cache: new Map() },
    };
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await channelTool({ mcpServer, toolName: 'channel', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const settings = { name: 'test', type: 0 };
    const result = await handler({ method: 'create', guildId: 'g', channelSettings: settings }, {});
    const res = JSON.parse(result.content[0].text).results;
    expect(create).toHaveBeenCalledWith(settings);
    expect(res).toEqual([{ created: true, id: 'new', name: 'test' }]);
  });
});
