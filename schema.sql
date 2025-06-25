DROP TABLE IF EXISTS `channels`;
CREATE TABLE `channels` (
  `app_id` varchar(32) DEFAULT NULL,
  `guild_id` varchar(32) DEFAULT NULL,
  `channel_id` varchar(32) DEFAULT NULL,
  `response_id` varchar(64) DEFAULT NULL,
  UNIQUE KEY `uniq_app_guild_channel` (`app_id`,`guild_id`,`channel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
