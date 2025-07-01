import { jest } from '@jest/globals';
import archive from '../../../tools/thread/archive.mjs';
describe('thread/archive', () => {
  it('archives a thread', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const setArchived = jest.fn();
    const thread = { id: 't', isThread: () => true, setArchived };
    const discord = { channels: { cache: new Map([['t', thread]]) } };
    const result = await archive({ threadId: 't', log, discord, buildResponse, toolName: 'thread' });
    expect(setArchived).toHaveBeenCalledWith(true);
    expect(result.results[0]).toHaveProperty('archived', true);
  });
});
