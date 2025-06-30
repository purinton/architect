export default async function ({ channelId, webhookId, log, discord, buildResponse, toolName }) {
  if (!webhookId) return buildResponse({ error: 'webhookId required for webhook-delete.' });
  const webhook = await discord.fetchWebhook(webhookId);
  if (!webhook) return buildResponse({ error: 'Webhook not found.' });
  await webhook.delete();
  return buildResponse({ deleted: true, id: webhookId });
}
