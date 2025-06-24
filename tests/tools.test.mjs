import fs from 'fs';
import { path, pathUrl } from '@purinton/path';
import { jest } from '@jest/globals';

describe('All custom tool handler files', () => {
    const toolsDir = path(import.meta, '..', 'tools');
    const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.mjs'));

    for (const file of files) {
        const filePathUrl = pathUrl(toolsDir, file);
        test(`${file} exports a default function`, async () => {
            const mod = await import(filePathUrl);
            expect(typeof mod.default).toBe('function');
        });

        test(`${file} registers a tool with the server (new pattern)`, async () => {
            const toolMock = jest.fn();
            const onMock = jest.fn();
            const logMock = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
            const mockServer = { tool: toolMock, on: onMock };
            const mod = await import(filePathUrl);
            await mod.default({ mcpServer: mockServer, toolName: 'test-tool', log: logMock });
            expect(toolMock).toHaveBeenCalled();
        });
    }
});

