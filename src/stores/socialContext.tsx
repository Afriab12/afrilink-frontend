'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Post,
  Comment,
  Community,
  Notification,
  Report,
  ReactionType,
  PostVisibility,
  FriendshipStatus,
  User,
} from '@/types';
import { mockBackend } from '@/services/mockBackend';
import { useAuth } from './authContext';

interface SocialContextType {
  posts: Post[];
  communities: Community[];
  notifications: Notification[];
  unreadNotifsCount: number;
  isLoadingPosts: boolean;
  hasMorePosts: boolean;
  loadMorePosts: () => void;
  createPost: (data: {
    content: string;
    visibility: PostVisibility;
    media?: Array<{ type: 'image' | 'video'; url: string; caption?: string }>;
    communityId?: string;
  }) => Post;
  deletePost: (postId: string) => void;
  reactToPost: (postId: string, reaction: ReactionType) => void;
  getCommentsForPost: (postId: string) => Comment[];
  addComment: (postId: string, content: string, parentId?: string | null) => Comment;
  likeComment: (commentId: string) => void;
  joinCommunity: (communityId: string) => void;
  createCommunity: (data: {
    name: string;
    description: string;
    category: string;
    country?: string;
    isPrivate: boolean;
    rules: string[];
  }) => Community;
  getFriendshipStatus: (userId: string) => FriendshipStatus;
  sendFriendRequest: (userId: string) => void;
  acceptFriendRequest: (userId: string) => void;
  declineFriendRequest: (userId: string) => void;
  cancelFriendRequest: (userId: string) => void;
  removeFriend: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  toggleFollow: (userId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  submitReport: (data: {
    targetType: Report['targetType'];
    targetId: string;
    targetPreview: string;
    category: Report['category'];
    details: string;
  }) => void;
  blockUser: (userId: string) => void;
  isUserBlocked: (userId: string) => boolean;
  refreshFeed: () => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const fetchInitialData = useCallback(() => {
    const { posts: fetchedPosts, nextCursor: cursor, hasMore } = mockBackend.getPosts(undefined, 10);
    const comms = mockBackend.getCommunities();
    const notifs = mockBackend.getNotifications();
    const blocked = mockBackend.getBlockedUsers();

    // Filter out posts from blocked users
    const filteredPosts = fetchedPosts.filter((p) => !blocked.includes(p.author.id));

    setPosts(filteredPosts);
    setNextCursor(cursor);
    setHasMorePosts(hasMore);
    setCommunities(comms);
    setNotifications(notifs);
    setBlockedUsers(blocked);
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData, refreshTrigger, currentUser]);

  const refreshFeed = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const loadMorePosts = () => {
    if (!hasMorePosts || isLoadingPosts || !nextCursor) return;
    setIsLoadingPosts(true);
    setTimeout(() => {
      const { posts: morePosts, nextCursor: newCursor, hasMore } = mockBackend.getPosts(nextCursor, 5);
      const filtered = morePosts.filter((p) => !blockedUsers.includes(p.author.id));
      setPosts((prev) => [...prev, ...filtered]);
      setNextCursor(newCursor);
      setHasMorePosts(hasMore);
      setIsLoadingPosts(false);
    }, 400);
  };

  const createPost = (data: {
    content: string;
    visibility: PostVisibility;
    media?: Array<{ type: 'image' | 'video'; url: string; caption?: string }>;
    communityId?: string;
  }) => {
    const newPost = mockBackend.createPost(data);
    setPosts((prev) => [newPost, ...prev]);
    return newPost;
  };

  const deletePost = (postId: string) => {
    mockBackend.deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const reactToPost = (postId: string, reaction: ReactionType) => {
    const updated = mockBackend.reactToPost(postId, reaction);
    if (updated) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...updated } : p)));
    }
  };

  const getCommentsForPost = (postId: string) => {
    return mockBackend.getComments(postId);
  };

  const addComment = (postId: string, content: string, parentId?: string | null) => {
    const newComment = mockBackend.createComment(postId, content, parentId);
    // Refresh post comment count in local state
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p))
    );
    return newComment;
  };

  const likeComment = (commentId: string) => {
    // Local optimistic update for comment
    const allComments = mockBackend.getComments('');
    const comment = allComments.find((c) => c.id === commentId);
    if (comment) {
      comment.isLikedByMe = !comment.isLikedByMe;
      comment.likesCount += comment.isLikedByMe ? 1 : -1;
      localStorage.setItem('afrilink_db_comments', JSON.stringify(allComments));
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const joinCommunity = (communityId: string) => {
    mockBackend.toggleJoinCommunity(communityId);
    setCommunities(mockBackend.getCommunities());
  };

  const createCommunity = (data: {
    name: string;
    description: string;
    category: string;
    country?: string;
    isPrivate: boolean;
    rules: string[];
  }) => {
    const newComm = mockBackend.createCommunity(data);
    setCommunities(mockBackend.getCommunities());
    return newComm;
  };

  const getFriendshipStatus = (userId: string) => {
    return mockBackend.getFriendshipStatus(userId);
  };

  const sendFriendRequest = (userId: string) => {
    mockBackend.setFriendshipStatus(userId, 'pending_sent');
    if (currentUser) {
      mockBackend.addNotification({
        type: 'friend_request',
        actor: currentUser,
        targetId: userId,
        targetSnippet: `${currentUser.fullName} sent you a friend request.`,
      });
    }
    setRefreshTrigger((prev) => prev + 1);
  };

  const acceptFriendRequest = (userId: string) => {
    mockBackend.setFriendshipStatus(userId, 'friends');
    if (currentUser) {
      mockBackend.addNotification({
        type: 'friend_request_accepted',
        actor: currentUser,
        targetId: userId,
        targetSnippet: `${currentUser.fullName} accepted your friend request.`,
      });
    }
    setRefreshTrigger((prev) => prev + 1);
  };

  const declineFriendRequest = (userId: string) => {
    mockBackend.setFriendshipStatus(userId, 'none');
    setRefreshTrigger((prev) => prev + 1);
  };

  const cancelFriendRequest = (userId: string) => {
    mockBackend.setFriendshipStatus(userId, 'none');
    setRefreshTrigger((prev) => prev + 1);
  };

  const removeFriend = (userId: string) => {
    mockBackend.setFriendshipStatus(userId, 'none');
    setRefreshTrigger((prev) => prev + 1);
  };

  const isFollowing = (userId: string) => {
    return mockBackend.getFollowStatus(userId);
  };

  const toggleFollow = (userId: string) => {
    const willFollow = mockBackend.toggleFollow(userId);
    if (willFollow && currentUser) {
      mockBackend.addNotification({
        type: 'follow',
        actor: currentUser,
        targetId: userId,
        targetSnippet: `${currentUser.fullName} started following you.`,
      });
    }
    setRefreshTrigger((prev) => prev + 1);
  };

  const markNotificationRead = (id: string) => {
    mockBackend.markNotificationAsRead(id);
    setNotifications(mockBackend.getNotifications());
  };

  const markAllNotificationsRead = () => {
    mockBackend.markAllNotificationsAsRead();
    setNotifications(mockBackend.getNotifications());
  };

  const submitReport = (data: {
    targetType: Report['targetType'];
    targetId: string;
    targetPreview: string;
    category: Report['category'];
    details: string;
  }) => {
    mockBackend.submitReport(data);
  };

  const blockUser = (userId: string) => {
    mockBackend.blockUser(userId);
    setBlockedUsers(mockBackend.getBlockedUsers());
    setPosts((prev) => prev.filter((p) => p.author.id !== userId));
  };

  const isUserBlocked = (userId: string) => {
    return blockedUsers.includes(userId);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SocialContext.Provider
      value={{
        posts,
        communities,
        notifications,
        unreadNotifsCount,
        isLoadingPosts,
        hasMorePosts,
        loadMorePosts,
        createPost,
        deletePost,
        reactToPost,
        getCommentsForPost,
        addComment,
        likeComment,
        joinCommunity,
        createCommunity,
        getFriendshipStatus,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        cancelFriendRequest,
        removeFriend,
        isFollowing,
        toggleFollow,
        markNotificationRead,
        markAllNotificationsRead,
        submitReport,
        blockUser,
        isUserBlocked,
        refreshFeed,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
