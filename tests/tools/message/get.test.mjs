import { jest } from '@jest/globals';
import get from '../../../tools/message/get.mjs';
describe('message/get', () => {
  it('gets messages', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const fetch = jest.fn(() => [{ id: 'm', content: 'hi', author: { id: 'a' } }]);
    const discord = { channels: { cache: new Map([['c', { messages: { fetch } }]]) } };
    const result = await get({ channelId: 'c', limit: 1, log, discord, buildResponse, toolName: 'message' });
    expect(fetch).toHaveBeenCalledWith({ limit: 1 });
    expect(result).toHaveProperty('messages');
    expect(result.messages[0]).toHaveProperty('id', 'm');
  });
});
