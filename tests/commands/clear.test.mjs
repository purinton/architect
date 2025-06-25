import { jest } from '@jest/globals';
import clear from '../../commands/clear.mjs';

describe('/clear command handler', () => {
  it('should reply with permissions error if not admin', async () => {
    const interaction = { member: { permissions: { has: () => false } }, reply: jest.fn() };
    const msg = jest.fn((key, def) => def);
    await clear({ client: { user: { id: 'bot' } }, log: { error: jest.fn() }, msg, db: {} }, interaction);
    expect(interaction.reply).toHaveBeenCalledWith({ content: expect.stringContaining('Administrator'), flags: expect.any(Number) });
  });
  it('should clear chat history and reply if admin', async () => {
    const db = { query: jest.fn() };
    const interaction = {
      member: { permissions: { has: () => true } },
      guild: { id: 'g' },
      channel: { id: 'c' },
      reply: jest.fn()
    };
    const msg = jest.fn((key, def) => def);
    await clear({ client: { user: { id: 'bot' } }, log: { error: jest.fn() }, msg, db }, interaction);
    expect(db.query).toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledWith({ content: expect.stringContaining('cleared') });
  });
});
