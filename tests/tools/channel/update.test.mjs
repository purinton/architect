import { jest } from '@jest/globals';
import channelTool from '../../../tools/channel.mjs';

describe('channel tool - update', () => {
  it('edits channel settings', async () => {
    const edit = jest.fn();
    const channelObj = { id: 'c', type: 0, edit };
    const discord = {
      channels: { cache: new Map([['c', channelObj]]) },
      guilds: { cache: new Map() },
    };
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await channelTool({ mcpServer, toolName: 'channel', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const settings = { nsfw: true };
    const result = await handler({ method: 'update', channelId: 'c', channelSettings: settings }, {});
    const res = JSON.parse(result.content[0].text).results;
    expect(edit).toHaveBeenCalledWith(settings);
    expect(res).toEqual([{ updated: true, id: 'c' }]);
  });
});
