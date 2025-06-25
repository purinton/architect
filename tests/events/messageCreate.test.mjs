import { jest } from '@jest/globals';
import messageCreateHandler from '../../events/messageCreate.mjs';
describe('messageCreate event handler', () => {
  it('ignores messages from self', async () => {
    const log = { debug: jest.fn() };
    const client = { user: { id: 'bot' } };
    const message = { id: '1', author: { id: 'bot' }, client };
    await messageCreateHandler({ client, log, msg: jest.fn(), db: {}, openai: {} }, message);
    expect(log.debug).toHaveBeenCalled();
  });
  // More tests can be added for other branches (admin, mention, etc.)
});
