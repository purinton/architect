import { jest } from '@jest/globals';
import * as openai from '../../src/openai.mjs';

describe('openai.getReply', () => {
  it('returns error if config is missing input', async () => {
    const log = { debug: jest.fn(), error: jest.fn() };
    const db = {};
    const fakeOpenai = { promptConfig: {}, responses: { create: jest.fn() } };
    const result = await openai.getReply(log, db, fakeOpenai, 'app', { id: 'g' }, { id: 'c' }, new Map());
    expect(result.text).toMatch(/error/i);
  });
  // More tests can be added for other branches, e.g. with valid config, with/without images, etc.
});
