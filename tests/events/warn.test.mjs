import { jest } from '@jest/globals';
import warnHandler from '../../events/warn.mjs';

describe('warn event handler', () => {
  it('logs warn event', async () => {
    const log = { warn: jest.fn() };
    await warnHandler({ log }, 'warn info');
    expect(log.warn).toHaveBeenCalledWith('warn', { warn: 'warn info' });
  });
});
