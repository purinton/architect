import { jest } from '@jest/globals';
import unpin from '../../../tools/message/unpin.mjs';
describe('message/unpin', () => {
  it('unpins a message', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const unpinFn = jest.fn();
    const fetch = jest.fn(() => ({ unpin: unpinFn }));
    const discord = { channels: { cache: new Map([['c', { messages: { fetch } }]]) } };
    const result = await unpin({ channelId: 'c', messageId: 'm', log, discord, buildResponse, toolName: 'message' });
    expect(fetch).toHaveBeenCalledWith('m');
    expect(unpinFn).toHaveBeenCalled();
    expect(result).toHaveProperty('unpinned', true);
  });
});
