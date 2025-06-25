import { jest } from '@jest/globals';
import interactionCreateHandler from '../../events/interactionCreate.mjs';
describe('interactionCreate event handler', () => {
  it('calls the correct command handler', async () => {
    const handler = jest.fn();
    const log = { debug: jest.fn() };
    const msg = jest.fn();
    const contextData = {};
    const interaction = { commandName: 'test', locale: 'en-US' };
    await interactionCreateHandler({ client: {}, log, msg, commandHandlers: { test: handler }, ...contextData }, interaction);
    expect(handler).toHaveBeenCalled();
  });
  it('does nothing if no handler', async () => {
    const log = { debug: jest.fn() };
    const msg = jest.fn();
    const contextData = {};
    const interaction = { commandName: 'none', locale: 'en-US' };
    await interactionCreateHandler({ client: {}, log, msg, commandHandlers: {}, ...contextData }, interaction);
    // Should not throw or call any handler
  });
});
