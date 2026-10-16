export type AfricanRegion = 'West Africa' | 'East Africa' | 'Southern Africa' | 'North Africa' | 'Central Africa';

export interface Country {
  code: string; // e.g. "NG", "GH", "KE", "ZA", "RW", "EG", "SN"
  name: string;
  region: AfricanRegion;
  flag: string; // emoji or url
  capital: string;
  population: string;
  description: string;
  popularInterests: string[];
}

export type PostVisibility = 'public' | 'friends' | 'community';

export type ReactionType = 'like' | 'love' | 'funny' | 'support' | 'sad' | 'angry';

export interface ReactionCount {
  like: number;
  love: number;
  funny: number;
  support: number;
  sad: number;
  angry: number;
}

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked';

export type UserRole = 'user' | 'creator' | 'community_manager' | 'admin';

export type AccountStatus = 'active' | 'warning' | 'restricted' | 'suspended' | 'banned' | 'deleted';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  bio: string;
  avatarUrl: string;
  coverImageUrl: string;
  country: string;
  countryCode: string;
  city: string;
  interests: string[];
  joinedDate: string;
  role: UserRole;
  status: AccountStatus;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  isVerified?: boolean;
  isCreator?: boolean;
}

export interface PostMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string | null; // For 2-tier replies
  author: User;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likesCount: number;
  isLikedByMe?: boolean;
  replies?: Comment[];
}

export interface Post {
  id: string;
  author: User;
  content: string;
  visibility: PostVisibility;
  media?: PostMedia[];
  communityId?: string;
  communityName?: string;
  countryCode?: string;
  createdAt: string;
  reactionsCount: ReactionCount;
  myReaction?: ReactionType | null;
  commentsCount: number;
  sharesCount: number;
  isSaved?: boolean;
  originalPost?: Post; // For shares
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  country?: string;
  countryCode?: string;
  profileImage: string;
  coverImage: string;
  isPrivate: boolean;
  memberCount: number;
  creatorId: string;
  moderatorIds: string[];
  rules: string[];
  isJoined?: boolean;
  myRole?: 'owner' | 'moderator' | 'member' | null;
  pendingRequestsCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
  isBlocked?: boolean;
}

export type NotificationType =
  | 'friend_request'
  | 'friend_request_accepted'
  | 'follow'
  | 'reaction'
  | 'comment'
  | 'comment_reply'
  | 'mention'
  | 'share'
  | 'community_invitation'
  | 'community_announcement'
  | 'new_message';

export interface Notification {
  id: string;
  type: NotificationType;
  actor: User;
  createdAt: string;
  isRead: boolean;
  targetId?: string; // postId, communityId, etc.
  targetSnippet?: string;
  reactionType?: ReactionType;
}

export type ReportCategory =
  | 'Spam'
  | 'Harassment'
  | 'Hate'
  | 'Impersonation'
  | 'Scam/fraud'
  | 'Violence'
  | 'Sexual content'
  | 'Misinformation'
  | 'Other';

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'user' | 'post' | 'comment' | 'community' | 'message';
  targetId: string;
  targetPreview: string;
  category: ReportCategory;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    field?: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string | null;
  hasMore: boolean;
  total?: number;
}
