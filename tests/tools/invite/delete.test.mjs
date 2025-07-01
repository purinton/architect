import { jest } from '@jest/globals';
import del from '../../../tools/invite/delete.mjs';
describe('invite/delete', () => {
  it('deletes an invite', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const deleteFn = jest.fn();
    const fetchInvite = jest.fn(() => ({ delete: deleteFn }));
    const discord = { fetchInvite };
    const result = await del({ inviteCode: 'abc', log, discord, buildResponse, toolName: 'invite' });
    expect(fetchInvite).toHaveBeenCalledWith('abc');
    expect(deleteFn).toHaveBeenCalled();
    expect(result).toHaveProperty('deleted', true);
  });
});
