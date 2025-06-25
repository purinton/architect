import { jest } from '@jest/globals';
import help from '../../commands/help.mjs';

describe('/help command handler', () => {
  it('should reply with help text', async () => {
    const interaction = { reply: jest.fn() };
    const msg = jest.fn((key, def) => def);
    const log = { debug: jest.fn() };
    await help({ log, msg }, interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ content: expect.any(String) }));
  });
});
