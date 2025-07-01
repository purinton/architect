import { jest } from '@jest/globals';
import react from '../../../tools/message/react.mjs';
describe('message/react', () => {
  it('reacts to a message', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const reactFn = jest.fn();
    const fetch = jest.fn(() => ({ react: reactFn }));
    const discord = { channels: { cache: new Map([['c', { messages: { fetch } }]]) } };
    const result = await react({ channelId: 'c', messageId: 'm', emoji: '😀', log, discord, buildResponse, toolName: 'message' });
    expect(fetch).toHaveBeenCalledWith('m');
    expect(reactFn).toHaveBeenCalledWith('😀');
    expect(result).toHaveProperty('reacted', true);
  });
});
