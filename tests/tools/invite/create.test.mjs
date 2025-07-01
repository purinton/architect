import { jest } from '@jest/globals';
import create from '../../../tools/invite/create.mjs';
describe('invite/create', () => {
  it('creates an invite', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const createInvite = jest.fn(() => ({ code: 'abc', url: 'url' }));
    const discord = { channels: { cache: new Map([['c', { createInvite }]]) } };
    const result = await create({ channelId: 'c', inviteSettings: {}, log, discord, buildResponse, toolName: 'invite' });
    expect(createInvite).toHaveBeenCalled();
    expect(result).toHaveProperty('created', true);
    expect(result).toHaveProperty('code', 'abc');
  });
});
