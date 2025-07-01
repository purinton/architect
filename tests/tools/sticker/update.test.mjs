import { jest } from '@jest/globals';
import update from '../../../tools/sticker/update.mjs';
describe('sticker/update', () => {
  it('updates a sticker', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const editFn = jest.fn();
    const sticker = { id: 's', edit: editFn };
    const guild = { stickers: { cache: new Map([['s', sticker]]) } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const result = await update({ guildId: 'g', stickerId: 's', stickerSettings: { name: 'new' }, log, discord, buildResponse, toolName: 'sticker' });
    expect(editFn).toHaveBeenCalledWith({ name: 'new' });
    expect(result).toHaveProperty('updated', true);
  });
});
