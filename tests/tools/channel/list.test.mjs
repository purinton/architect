import { jest } from '@jest/globals';
import channelTool from '../../../tools/channel.mjs';

describe('channel tool - list', () => {
  it('returns channels', async () => {
    const chanObj = { id: 'c1', name: 'one', type: 1 };
    const guild = { channels: { cache: { map: (fn) => [chanObj] } } };
    const discord = {
      guilds: { cache: new Map([['g', guild]]) },
      channels: { cache: new Map() },
    };
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await channelTool({ mcpServer, toolName: 'channel', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const result = await handler({ method: 'list', guildId: 'g' }, {});
    const chans = JSON.parse(result.content[0].text).channels;
    expect(chans).toEqual([{ id: 'c1', name: 'one', type: 1 }]);
  });
});
