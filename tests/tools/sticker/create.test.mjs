import { jest } from '@jest/globals';
import create from '../../../tools/sticker/create.mjs';
describe('sticker/create', () => {
  it('creates a sticker', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const createFn = jest.fn(() => ({ id: 's', name: 'st' }));
    const guild = { stickers: { create: createFn, cache: new Map() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const result = await create({ guildId: 'g', stickerSettings: { name: 'st', file: 'f', tags: 't' }, log, discord, buildResponse, toolName: 'sticker' });
    expect(createFn).toHaveBeenCalled();
    expect(result).toHaveProperty('created', true);
  });
});
