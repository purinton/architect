import { jest } from '@jest/globals';
import list from '../../../tools/sticker/list.mjs';
describe('sticker/list', () => {
  it('lists stickers', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const stickers = [{ id: 's', name: 'st', tags: 't' }];
    const guild = { stickers: { cache: stickers } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const result = await list({ guildId: 'g', log, discord, buildResponse, toolName: 'sticker' });
    expect(result.stickers[0]).toHaveProperty('id', 's');
  });
});
