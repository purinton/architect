import { jest } from '@jest/globals';
import del from '../../../tools/sticker/delete.mjs';
describe('sticker/delete', () => {
  it('deletes a sticker', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const deleteFn = jest.fn();
    const sticker = { id: 's', delete: deleteFn };
    const guild = { stickers: { cache: new Map([['s', sticker]]) } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const result = await del({ guildId: 'g', stickerId: 's', log, discord, buildResponse, toolName: 'sticker' });
    expect(deleteFn).toHaveBeenCalled();
    expect(result).toHaveProperty('deleted', true);
  });
});
