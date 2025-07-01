import { jest } from '@jest/globals';
import pin from '../../../tools/message/pin.mjs';
describe('message/pin', () => {
  it('pins a message', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const pinFn = jest.fn();
    const fetch = jest.fn(() => ({ pin: pinFn }));
    const discord = { channels: { cache: new Map([['c', { messages: { fetch } }]]) } };
    const result = await pin({ channelId: 'c', messageId: 'm', log, discord, buildResponse, toolName: 'message' });
    expect(fetch).toHaveBeenCalledWith('m');
    expect(pinFn).toHaveBeenCalled();
    expect(result).toHaveProperty('pinned', true);
  });
});
