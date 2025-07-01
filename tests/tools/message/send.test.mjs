import { jest } from '@jest/globals';
import send from '../../../tools/message/send.mjs';
describe('message/send', () => {
  it('sends a message', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const sendFn = jest.fn(() => ({ id: 'm' }));
    const discord = { channels: { cache: new Map([['c', { send: sendFn }]]) } };
    const result = await send({ channelId: 'c', messageSettings: { content: 'hi' }, log, discord, buildResponse, toolName: 'message' });
    expect(sendFn).toHaveBeenCalledWith({ content: 'hi' });
    expect(result).toHaveProperty('sent', true);
    expect(result).toHaveProperty('id', 'm');
  });
});
