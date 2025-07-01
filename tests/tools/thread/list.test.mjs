import { jest } from '@jest/globals';
import list from '../../../tools/thread/list.mjs';
describe('thread/list', () => {
  it('lists threads', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const fetch = jest.fn(() => ({ threads: [{ id: 't', name: 'th', archived: false }] }));
    const channel = { threads: { fetch } };
    const discord = { channels: { cache: new Map([['c', channel]]) } };
    const result = await list({ channelId: 'c', log, discord, buildResponse, toolName: 'thread' });
    expect(fetch).toHaveBeenCalled();
    expect(result.threads[0]).toHaveProperty('id', 't');
  });
});
