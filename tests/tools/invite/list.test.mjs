import { jest } from '@jest/globals';
import list from '../../../tools/invite/list.mjs';
describe('invite/list', () => {
  it('lists invites', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const fetchInvites = jest.fn(() => [{ code: 'abc', url: 'url', uses: 1 }]);
    const discord = { channels: { cache: new Map([['c', { fetchInvites }]]) } };
    const result = await list({ channelId: 'c', log, discord, buildResponse, toolName: 'invite' });
    expect(fetchInvites).toHaveBeenCalled();
    expect(result).toHaveProperty('invites');
    expect(result.invites[0]).toHaveProperty('code', 'abc');
  });
});
