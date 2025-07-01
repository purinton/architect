import { jest } from '@jest/globals';
import edit from '../../../tools/message/edit.mjs';
describe('message/edit', () => {
  it('edits a message', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const editFn = jest.fn(() => ({ content: 'edited' }));
    const fetch = jest.fn(() => ({ edit: editFn }));
    const discord = { channels: { cache: new Map([['c', { messages: { fetch } }]]) } };
    const result = await edit({ channelId: 'c', messageId: 'm', messageSettings: { content: 'edited' }, log, discord, buildResponse, toolName: 'message' });
    expect(fetch).toHaveBeenCalledWith('m');
    expect(editFn).toHaveBeenCalledWith({ content: 'edited' });
    expect(result).toHaveProperty('edited', true);
    expect(result).toHaveProperty('content', 'edited');
  });
});
