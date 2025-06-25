import { jest } from '@jest/globals';
import whoamiTool from '../../tools/who-am-i.mjs';
describe('who-am-i tool', () => {
  it('registers tool and returns user info', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn() };
    const discord = { user: { id: '1', username: 'bot', discriminator: '0001', tag: 'bot#0001', displayAvatarURL: jest.fn(), bot: true, createdAt: new Date(), system: false, flags: { toArray: jest.fn(() => ['flag']) } } };
    await whoamiTool({ mcpServer, toolName: 'who-am-i', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const result = await handler({}, {});
    // Extract user info from buildResponse output
    const userInfo = JSON.parse(result.content[0].text);
    expect(userInfo).toHaveProperty('id', '1');
    expect(userInfo).toHaveProperty('username', 'bot');
  });
});
