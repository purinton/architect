import { jest } from '@jest/globals';
import create from '../../../tools/thread/create.mjs';
describe('thread/create', () => {
  it('creates a thread', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const createFn = jest.fn(() => ({ id: 't', name: 'th' }));
    const channel = { threads: { create: createFn } };
    const discord = { channels: { cache: new Map([['c', channel]]) } };
    const result = await create({ channelId: 'c', threadSettings: { name: 'th' }, log, discord, buildResponse, toolName: 'thread' });
    expect(createFn).toHaveBeenCalledWith({ name: 'th' });
    expect(result.results[0]).toHaveProperty('created', true);
  });
});
