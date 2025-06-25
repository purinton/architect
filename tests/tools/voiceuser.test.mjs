import { jest } from '@jest/globals';
import voiceuserTool from '../../tools/voiceuser.mjs';
describe('voiceuser tool', () => {
  it('registers tool and handles invalid method', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map([['g', { members: { cache: new Map([['u', { voice: { setChannel: jest.fn(), disconnect: jest.fn(), setMute: jest.fn(), setDeaf: jest.fn() } }]]) } }]]) } };
    await voiceuserTool({ mcpServer, toolName: 'voiceuser', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    await expect(handler({ guildId: 'g', userId: 'u', method: 'invalid' }, {})).rejects.toThrow('Invalid method.');
  });
});
