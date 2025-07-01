import { jest } from '@jest/globals';
import del from '../../../tools/thread/delete.mjs';
describe('thread/delete', () => {
  it('deletes a thread', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const deleteFn = jest.fn();
    const thread = { id: 't', isThread: () => true, delete: deleteFn };
    const discord = { channels: { cache: new Map([['t', thread]]) } };
    const result = await del({ threadId: 't', log, discord, buildResponse, toolName: 'thread' });
    expect(deleteFn).toHaveBeenCalled();
    expect(result.results[0]).toHaveProperty('deleted', true);
  });
});
