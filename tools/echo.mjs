import { z, buildResponse } from '@purinton/mcp-server';

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    "Echo Tool",
    { echoText: z.string() },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const response = {
        echoText: _args.echoText
      }
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
