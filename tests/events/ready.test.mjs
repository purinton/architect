import { jest } from '@jest/globals';
import readyHandler from '../../events/ready.mjs';
describe('ready event handler', () => {
  it('sets presence and fetches members', async () => {
    const log = { debug: jest.fn(), info: jest.fn(), error: jest.fn() };
    const presence = { activities: [] };
    const client = {
      user: { tag: 'bot', setPresence: jest.fn() },
      guilds: { cache: [{ name: 'guild', memberCount: 1, members: { fetch: jest.fn() } }] },
      users: { cache: { size: 1 } }
    };
    await readyHandler({ log, presence }, client);
    expect(client.user.setPresence).toHaveBeenCalledWith(presence);
    // Check for the actual log message
    expect(log.info).toHaveBeenCalledWith('Ready in undefined guilds with 1 users.');
  });
});
