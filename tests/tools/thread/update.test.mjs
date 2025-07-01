import { jest } from '@jest/globals';
import update from '../../../tools/thread/update.mjs';
describe('thread/update', () => {
  it('updates a thread', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const editFn = jest.fn();
    const thread = { id: 't', isThread: () => true, edit: editFn };
    const discord = { channels: { cache: new Map([['t', thread]]) } };
    const result = await update({ threadId: 't', threadSettings: { name: 'new' }, log, discord, buildResponse, toolName: 'thread' });
    expect(editFn).toHaveBeenCalledWith({ name: 'new' });
    expect(result.results[0]).toHaveProperty('updated', true);
  });
});
