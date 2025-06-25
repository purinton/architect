import { jest } from '@jest/globals';
import invalidatedHandler from '../../events/invalidated.mjs';

describe('invalidated event handler', () => {
  it('logs invalidated event', async () => {
    const log = { debug: jest.fn() };
    await invalidatedHandler({ log });
    expect(log.debug).toHaveBeenCalledWith('invalidated');
  });
});
