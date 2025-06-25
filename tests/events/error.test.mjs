import { jest } from '@jest/globals';
import errorHandler from '../../events/error.mjs';

describe('error event handler', () => {
  it('logs error event', async () => {
    const log = { error: jest.fn() };
    await errorHandler({ log }, 'err');
    expect(log.error).toHaveBeenCalledWith('error', { error: 'err' });
  });
});
