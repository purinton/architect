import { jest } from '@jest/globals';
import get from '../../../tools/thread/get.mjs';
describe('thread/get', () => {
  it('gets a thread', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const thread = { id: 't', name: 'th', archived: false, autoArchiveDuration: 60, rateLimitPerUser: 0, parentId: 'c', isThread: () => true };
    const discord = { channels: { cache: new Map([['t', thread]]) } };
    const result = await get({ threadId: 't', log, discord, buildResponse, toolName: 'thread' });
    expect(result.results[0]).toHaveProperty('id', 't');
  });
});
