import { jest } from '@jest/globals';
import bulkDelete from '../../../tools/message/bulkDelete.mjs';
describe('message/bulkDelete', () => {
  it('bulk deletes messages', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const bulkDeleteFn = jest.fn(() => ({ size: 2 }));
    const discord = { channels: { cache: new Map([['c', { bulkDelete: bulkDeleteFn }]]) } };
    const result = await bulkDelete({ channelId: 'c', messageIds: ['1', '2'], log, discord, buildResponse, toolName: 'message' });
    expect(bulkDeleteFn).toHaveBeenCalledWith(['1', '2']);
    expect(result).toHaveProperty('deleted', true);
    expect(result).toHaveProperty('count', 2);
  });
});
