import { jest } from '@jest/globals';
import roleTool from '../../tools/role.mjs';
import { PermissionsBitField } from 'discord.js';

describe('role tool', () => {
  it('registers tool and handles invalid method', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = {
      guilds: {
        cache: new Map([
          [
            'g',
            {
              roles: {
                cache: new Map([
                  [
                    'r',
                    { id: 'r', name: 'role', edit: jest.fn(), delete: jest.fn() }
                  ]
                ]),
                create: jest.fn(() => ({ id: 'r', name: 'role' }))
              },
              members: {
                cache: new Map([
                  [
                    'm',
                    { roles: { add: jest.fn(), remove: jest.fn() } }
                  ]
                ])
              }
            }
          ]
        ])
      },
      roles: {
        cache: new Map([
          [
            'r',
            { id: 'r', name: 'role', edit: jest.fn(), delete: jest.fn() }
          ]
        ])
      }
    };
    await roleTool({ mcpServer, toolName: 'role', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const result = await handler({ guildId: 'g', method: 'invalid' }, {});
    expect(result).toHaveProperty('content');
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty('text');
    const errorObj = JSON.parse(result.content[0].text);
    expect(errorObj).toMatchObject({ error: 'Invalid method.' });
  });

  it('creates a role with permissions using camel-case names', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const create = jest.fn(opts => ({ id: 'r', name: opts.name }));
    const discord = {
      guilds: {
        cache: new Map([
          [
            'g',
            {
              roles: {
                cache: new Map(),
                create
              },
              members: { cache: new Map() }
            }
          ]
        ])
      },
      roles: { cache: new Map() }
    };
    await roleTool({ mcpServer, toolName: 'role', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const result = await handler({
      guildId: 'g',
      method: 'create',
      roleSettings: { name: 'test', permissions: ['ViewChannel', 'SendMessages'] }
    }, {});
    expect(result).toHaveProperty('content');
    expect(create).toHaveBeenCalledWith({
      name: 'test',
      permissions: PermissionsBitField.resolve([
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages
      ])
    });
  });
});
