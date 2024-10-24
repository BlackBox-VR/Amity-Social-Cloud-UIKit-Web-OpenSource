export const PageTypes = {
  Explore: 'explore',
  Category: 'category',
  NewsFeed: 'newsfeed',
  UserFeed: 'userfeed',
  CommunityFeed: 'communityfeed',
  CommunityEdit: 'communityedit',
  UserEdit: 'useredit',
  Search: 'search',
  ChatSearch: 'chatsearch',
  Post: 'post',
};

export const MemberRoles = Object.freeze({
  MEMBER: 'member',
  COMMUNITY_MODERATOR: 'community-moderator',
  CHANNEL_MODERATOR: 'channel-moderator',
});

export const MAXIMUM_MENTIONEES = 30;

export const VideoFileStatus = Object.freeze({
  Uploaded: 'uploaded',
  Transcoding: 'transcoding',
  Transcoded: 'transcoded',
  TranscodeFailed: 'transcodeFailed',
});

export const VideoQuality = Object.freeze({
  FHD: '1080p',
  HD: '720p',
  SD: '480p',
  LD: '360p',
  Original: 'original',
});

export const MP4MimeType = 'video/mp4';

export const UnityMessageBaseURLs = {
  QUEST: 'uniwebview://quest?',
  CLAIM_REWARDS: 'uniwebview://claim?',
};

export const UnityMessageKeys = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  TEAM_POST: 'team-post',
  CLAIM_CAREPOINTS: 'claim-carepoints',
};
