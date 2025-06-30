export default async function ({ channelId, log, discord, buildResponse, toolName }) {
  const channelIds = Array.isArray(channelId) ? channelId.filter(Boolean) : channelId ? [channelId].filter(Boolean) : [];
  if (!channelIds.length) {
    log.error(`[${toolName}] channelId(s) required for get.`);
    return buildResponse({ error: 'channelId(s) required for get.' });
  }
  const results = channelIds.map(cid => {
    const channel = discord.channels.cache.get(cid);
    if (!channel) return { error: 'Channel not found', id: cid };
    log.debug(`[${toolName}] Channel found`, { id: channel.id });
    return {
      id: channel.id,
      name: channel.name,
      type: channel.type,
      topic: channel.topic,
      nsfw: channel.nsfw,
      bitrate: channel.bitrate,
      userLimit: channel.userLimit,
      parent: channel.parentId,
      position: channel.position,
      rateLimitPerUser: channel.rateLimitPerUser,
    };
  });
  return buildResponse({ results });
}
