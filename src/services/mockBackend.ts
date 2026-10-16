import type {
  User,
  Post,
  Comment,
  Community,
  Message,
  Conversation,
  Notification,
  Report,
  ReactionType,
  PostVisibility,
  FriendshipStatus,
  AccountStatus,
} from '../types/index.ts';

const STORAGE_KEY_PREFIX = 'afrilink_db_';

// Initial Mock Seed Data
export const INITIAL_USERS: User[] = [
  {
    id: 'user-current',
    username: 'kwame_mensah',
    fullName: 'Kwame Mensah',
    email: 'kwame@afrilink.africa',
    phone: '+233 24 123 4567',
    bio: 'Software Architect & Pan-African tech builder. Passionate about linking African ecosystems from Accra to Nairobi. 🇬🇭🚀',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80',
    country: 'Ghana',
    countryCode: 'GH',
    city: 'Accra',
    interests: ['Technology & Startups', 'Afrobeats & Amapiano Music', 'Pan-African Business & Trade'],
    joinedDate: '2024-01-15',
    role: 'creator',
    status: 'active',
    followersCount: 1420,
    followingCount: 384,
    friendsCount: 245,
    isVerified: true,
    isCreator: true,
  },
  {
    id: 'user-amina',
    username: 'amina_bello',
    fullName: 'Amina Bello',
    email: 'amina@lagos.tech',
    phone: '+234 80 987 6543',
    bio: 'Fintech Product Lead in Lagos. Advocating for borderless financial infrastructure across the continent. 🇳🇬💳',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    country: 'Nigeria',
    countryCode: 'NG',
    city: 'Lagos',
    interests: ['Technology & Startups', 'Pan-African Business & Trade', 'Education & Scholarships'],
    joinedDate: '2024-02-10',
    role: 'community_manager',
    status: 'active',
    followersCount: 3890,
    followingCount: 512,
    friendsCount: 310,
    isVerified: true,
    isCreator: true,
  },
  {
    id: 'user-samuel',
    username: 'sam_nairobi',
    fullName: 'Samuel Kamau',
    email: 'samuel@silicon.ke',
    phone: '+254 71 234 5678',
    bio: 'Agritech researcher & AI enthusiast based in Nairobi. Building smart weather models for African farmers. 🇰🇪🌾',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?auto=format&fit=crop&w=1200&q=80',
    country: 'Kenya',
    countryCode: 'KE',
    city: 'Nairobi',
    interests: ['Technology & Startups', 'African Football & Sports', 'Travel & Explore Africa'],
    joinedDate: '2024-03-01',
    role: 'user',
    status: 'active',
    followersCount: 940,
    followingCount: 420,
    friendsCount: 180,
    isVerified: true,
  },
  {
    id: 'user-tendai',
    username: 'tendai_moyo',
    fullName: 'Tendai Moyo',
    email: 'tendai@hararearts.zw',
    bio: 'Contemporary stone sculptor & creative curator. Documenting modern Shona artistic expressions. 🇿🇼🎨',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1200&q=80',
    country: 'Zimbabwe',
    countryCode: 'ZW',
    city: 'Harare',
    interests: ['Visual Arts, Film & Cinema', 'History, Heritage & Culture', 'African Fashion & Design'],
    joinedDate: '2024-04-12',
    role: 'creator',
    status: 'active',
    followersCount: 1650,
    followingCount: 290,
    friendsCount: 140,
    isVerified: false,
    isCreator: true,
  },
  {
    id: 'user-thabo',
    username: 'thabo_beats',
    fullName: 'Thabo Dlamini',
    email: 'thabo@joburgsound.za',
    bio: 'Amapiano producer & DJ in Johannesburg. Taking African rhythms to the four corners of the earth. 🇿🇦🎹',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    country: 'South Africa',
    countryCode: 'ZA',
    city: 'Johannesburg',
    interests: ['Afrobeats & Amapiano Music', 'Comedy & Entertainment', 'African Fashion & Design'],
    joinedDate: '2024-03-20',
    role: 'creator',
    status: 'active',
    followersCount: 5400,
    followingCount: 310,
    friendsCount: 420,
    isVerified: true,
    isCreator: true,
  },
  {
    id: 'user-fatima',
    username: 'fatima_cairo',
    fullName: 'Fatima Al-Mansoor',
    email: 'fatima@cairo.eg',
    bio: 'Architectural historian & Nile traveler. Bridging North African design heritage with modern African cities. 🇪🇬🏛️',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    country: 'Egypt',
    countryCode: 'EG',
    city: 'Cairo',
    interests: ['History, Heritage & Culture', 'Visual Arts, Film & Cinema', 'Travel & Explore Africa'],
    joinedDate: '2024-05-02',
    role: 'user',
    status: 'active',
    followersCount: 2100,
    followingCount: 340,
    friendsCount: 220,
    isVerified: true,
  },
  {
    id: 'user-admin',
    username: 'afrilink_admin',
    fullName: 'AfriLink Trust & Safety Admin',
    email: 'admin@afrilink.africa',
    bio: 'Official AfriLink platform operations and moderation account.',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    country: 'Nigeria',
    countryCode: 'NG',
    city: 'Abuja',
    interests: ['Technology & Startups', 'Community Development'],
    joinedDate: '2023-11-01',
    role: 'admin',
    status: 'active',
    followersCount: 12500,
    followingCount: 10,
    friendsCount: 15,
    isVerified: true,
  },
];

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'comm-afrotech',
    name: 'AfroTech Innovators',
    slug: 'afrotech-innovators',
    description: 'The premier community connecting African founders, software engineers, and product builders across 54 nations.',
    category: 'Technology',
    country: 'Pan-African',
    profileImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    isPrivate: false,
    memberCount: 8450,
    creatorId: 'user-amina',
    moderatorIds: ['user-amina', 'user-current'],
    rules: [
      'Celebrate and support African technological sovereignty.',
      'Constructive feedback only; no unsolicited promotions.',
      'Share practical insights, open source code, and hiring opportunities.',
    ],
    isJoined: true,
    myRole: 'moderator',
  },
  {
    id: 'comm-amapiano',
    name: 'Amapiano & Afrobeats Global',
    slug: 'amapiano-afrobeats-global',
    description: 'Celebrating the pulse of African music taking the world by storm. Track drops, playlists, concert meetups & producers room.',
    category: 'Music',
    country: 'Pan-African',
    profileImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    isPrivate: false,
    memberCount: 12900,
    creatorId: 'user-thabo',
    moderatorIds: ['user-thabo'],
    rules: [
      'Credit original producers, beatmakers, and vocalists.',
      'Respect all regional musical lineages from Kwaito to Highlife.',
      'No piracy or malicious streaming links.',
    ],
    isJoined: true,
    myRole: 'member',
  },
  {
    id: 'comm-lagos-creatives',
    name: 'Lagos Creative Hub',
    slug: 'lagos-creatives',
    description: 'Cinematographers, fashion visionaries, writers and visual artists collaborating across the vibrant streets of Lagos.',
    category: 'Culture',
    country: 'Nigeria',
    countryCode: 'NG',
    profileImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    isPrivate: false,
    memberCount: 5320,
    creatorId: 'user-amina',
    moderatorIds: ['user-amina'],
    rules: [
      'Support local talent and fair compensation for African artists.',
      'Share high-resolution original media.',
    ],
    isJoined: false,
    myRole: null,
  },
  {
    id: 'comm-nairobi-climate',
    name: 'East African Climate & AgriTech',
    slug: 'east-african-climate',
    description: 'Uniting Kenyan, Ugandan, Rwandan and Tanzanian climate innovators applying AI and drones to agriculture.',
    category: 'Business',
    country: 'Kenya',
    countryCode: 'KE',
    profileImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    isPrivate: true,
    memberCount: 3180,
    creatorId: 'user-samuel',
    moderatorIds: ['user-samuel'],
    rules: [
      'Research-backed discussions on African agricultural resilience.',
      'Private community: please state your area of research upon requesting access.',
    ],
    isJoined: false,
    myRole: null,
  },
  {
    id: 'comm-pan-african-trade',
    name: 'AfCFTA Cross-Border Trade & SMEs',
    slug: 'afcfta-trade',
    description: 'Navigating inter-African commerce, payments, logistics, and supply chains under the African Continental Free Trade Area.',
    category: 'Business',
    country: 'Pan-African',
    profileImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    isPrivate: false,
    memberCount: 6710,
    creatorId: 'user-current',
    moderatorIds: ['user-current'],
    rules: [
      'Factual regulatory discussions.',
      'Honest reviews of inter-country logistics and customs clearing.',
    ],
    isJoined: true,
    myRole: 'owner',
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    author: INITIAL_USERS[1], // Amina Bello
    content: `Big milestone today! 🚀 We just piloted our first instant cross-border settlement between Nigeria and Ghana using open APIs. 
Reducing transaction fees for small traders across West Africa isn't just a technical challenge—it's unlocking billions in domestic trade.

Africa's digital infrastructure is being built by us, for us! What cross-border payment bottlenecks are you facing right now? 💬`,
    visibility: 'public',
    countryCode: 'NG',
    communityId: 'comm-afrotech',
    communityName: 'AfroTech Innovators',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    media: [
      {
        id: 'media-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80',
        caption: 'Fintech team testing real-time cross border remittances',
      },
    ],
    reactionsCount: {
      like: 48,
      love: 32,
      funny: 1,
      support: 65,
      sad: 0,
      angry: 0,
    },
    myReaction: 'support',
    commentsCount: 14,
    sharesCount: 18,
    isSaved: true,
  },
  {
    id: 'post-2',
    author: INITIAL_USERS[0], // Kwame Mensah
    content: `Greetings from the shores of Accra! 🇬🇭 Checking in with the AfriLink community. 
Today we're laying the foundation for a truly unified digital home for Africans everywhere—from the diaspora in London and Atlanta to everyday visionaries in Lagos, Nairobi, and Cairo.

Take a look at the Sunset over Labadi Beach after an inspiring day of code and community building. 🌅`,
    visibility: 'public',
    countryCode: 'GH',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    media: [
      {
        id: 'media-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        caption: 'Sunset in Accra, Ghana',
      },
    ],
    reactionsCount: {
      like: 72,
      love: 54,
      funny: 0,
      support: 30,
      sad: 0,
      angry: 0,
    },
    myReaction: 'love',
    commentsCount: 22,
    sharesCount: 11,
    isSaved: false,
  },
  {
    id: 'post-3',
    author: INITIAL_USERS[2], // Samuel Kamau
    content: `Excited to deploy our IoT soil moisture probes in the Rift Valley this morning! 🇰🇪 Sensor costs have dropped 60%, allowing local smallholders to double their harvest efficiency while conserving water.

Tech in Africa is solving real-world, high-impact problems every single day. Here's a quick preview clip of the field sensors in action!`,
    visibility: 'public',
    countryCode: 'KE',
    communityId: 'comm-nairobi-climate',
    communityName: 'East African Climate & AgriTech',
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
    media: [
      {
        id: 'media-3',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-drone-shot-of-a-lush-green-field-41551-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80',
        caption: 'Drone view of AgriTech deployment in Rift Valley',
      },
    ],
    reactionsCount: {
      like: 61,
      love: 40,
      funny: 0,
      support: 82,
      sad: 0,
      angry: 0,
    },
    myReaction: null,
    commentsCount: 9,
    sharesCount: 26,
    isSaved: false,
  },
  {
    id: 'post-4',
    author: INITIAL_USERS[4], // Thabo Dlamini
    content: `Johannesburg tonight! 🇿🇦 The new Amapiano bassline we cooked in studio with live log drums and saxophone is sounding unbelievable. 
The African soundscape is undeniable right now. Dropping the snippet exclusively in the Amapiano & Afrobeats Global community tomorrow! Who wants early access? 🎹🔥`,
    visibility: 'public',
    countryCode: 'ZA',
    communityId: 'comm-amapiano',
    communityName: 'Amapiano & Afrobeats Global',
    createdAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    media: [
      {
        id: 'media-4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=80',
        caption: 'Studio session in Maboneng, Johannesburg',
      },
    ],
    reactionsCount: {
      like: 110,
      love: 88,
      funny: 5,
      support: 45,
      sad: 0,
      angry: 0,
    },
    myReaction: 'like',
    commentsCount: 31,
    sharesCount: 42,
    isSaved: true,
  },
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm-1',
    postId: 'post-1',
    author: INITIAL_USERS[0], // Kwame
    content: 'Huge congratulations Amina! The interoperability between Ghipss and NIBSS is exactly what we have discussed at the forum. Let us integrate this with our merchant pilot next month!',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    likesCount: 12,
    isLikedByMe: true,
    replies: [
      {
        id: 'comm-1-1',
        postId: 'post-1',
        parentId: 'comm-1',
        author: INITIAL_USERS[1], // Amina
        content: '@kwame_mensah absolutely! The sandbox credentials will be ready by Friday. Let us set up a demo call.',
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        likesCount: 5,
        isLikedByMe: false,
      },
    ],
  },
  {
    id: 'comm-2',
    postId: 'post-1',
    author: INITIAL_USERS[2], // Samuel
    content: 'Remarkable progress. Are there plans to bridge this with Kenya M-Pesa corridors as well?',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    likesCount: 7,
    isLikedByMe: false,
    replies: [],
  },
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-amina',
    senderId: 'user-amina',
    sender: INITIAL_USERS[1],
    content: 'Hi Kwame! Did you see the cross-border API release notes? We should review the tokenization layer together.',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isRead: true,
  },
  {
    id: 'msg-2',
    conversationId: 'conv-amina',
    senderId: 'user-current',
    sender: INITIAL_USERS[0],
    content: 'Hey Amina! Yes, just read through the docs. The sub-second settlement time looks fantastic. Let us sync this afternoon.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    isRead: true,
  },
  {
    id: 'msg-3',
    conversationId: 'conv-amina',
    senderId: 'user-amina',
    sender: INITIAL_USERS[1],
    content: 'Perfect. I will send over the Swagger contract now. Looking forward to our demo!',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    isRead: false,
  },
  {
    id: 'msg-4',
    conversationId: 'conv-samuel',
    senderId: 'user-samuel',
    sender: INITIAL_USERS[2],
    content: 'Kwame, hope you are doing well in Accra! Let me know when you visit Nairobi next month.',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    isRead: true,
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-amina',
    participant: INITIAL_USERS[1], // Amina
    lastMessage: INITIAL_MESSAGES[2],
    unreadCount: 1,
    updatedAt: INITIAL_MESSAGES[2].createdAt,
  },
  {
    id: 'conv-samuel',
    participant: INITIAL_USERS[2], // Samuel
    lastMessage: INITIAL_MESSAGES[3],
    unreadCount: 0,
    updatedAt: INITIAL_MESSAGES[3].createdAt,
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'reaction',
    actor: INITIAL_USERS[1], // Amina
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isRead: false,
    targetId: 'post-2',
    targetSnippet: 'Greetings from the shores of Accra! Checking in with...',
    reactionType: 'love',
  },
  {
    id: 'notif-2',
    type: 'friend_request',
    actor: INITIAL_USERS[3], // Tendai Moyo
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isRead: false,
    targetId: 'user-tendai',
    targetSnippet: 'Tendai Moyo sent you a friend request.',
  },
  {
    id: 'notif-3',
    type: 'comment',
    actor: INITIAL_USERS[1], // Amina
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    isRead: true,
    targetId: 'post-1',
    targetSnippet: '@kwame_mensah absolutely! The sandbox credentials will be ready...',
  },
  {
    id: 'notif-4',
    type: 'community_invitation',
    actor: INITIAL_USERS[4], // Thabo
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    isRead: true,
    targetId: 'comm-amapiano',
    targetSnippet: 'Invited you to join Amapiano & Afrobeats Global.',
  },
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-1',
    reporterId: 'user-samuel',
    reporterName: 'Samuel Kamau',
    targetType: 'post',
    targetId: 'post-spam-99',
    targetPreview: 'Earn $500 daily guaranteed crypto clicks link here...',
    category: 'Spam',
    details: 'Unsolicited repetitive commercial spam bot posting financial schemes.',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'rep-2',
    reporterId: 'user-amina',
    reporterName: 'Amina Bello',
    targetType: 'user',
    targetId: 'user-troll-1',
    targetPreview: '@fake_official_afrilink',
    category: 'Impersonation',
    details: 'Impersonating official AfriLink administration account asking for user credentials.',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
];

// Memory/LocalStorage Database Handler
class AfriLinkBackendService {
  private isBrowser = typeof window !== 'undefined';
  private memoryStore = new Map<string, any>();

  private getItem<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser) {
      return this.memoryStore.has(key) ? this.memoryStore.get(key) : defaultValue;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isBrowser) {
      this.memoryStore.set(key, value);
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error', e);
    }
  }

  // Current session user
  getCurrentUser(): User {
    return this.getItem<User>('current_user', INITIAL_USERS[0]);
  }

  setCurrentUser(user: User): void {
    this.setItem<User>('current_user', user);
  }

  // All Users
  getUsers(): User[] {
    return this.getItem<User[]>('users', INITIAL_USERS);
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id || u.username === id);
  }

  updateUserProfile(updatedData: Partial<User>): User {
    const current = this.getCurrentUser();
    const updated = { ...current, ...updatedData };
    this.setCurrentUser(updated);

    const users = this.getUsers().map((u) => (u.id === current.id ? updated : u));
    this.setItem('users', users);
    return updated;
  }

  // Friendship and Follow Status
  getFriendshipStatus(targetUserId: string): FriendshipStatus {
    const friendMap = this.getItem<Record<string, FriendshipStatus>>('friendships', {
      'user-amina': 'friends',
      'user-samuel': 'friends',
      'user-tendai': 'pending_received',
    });
    return friendMap[targetUserId] || 'none';
  }

  setFriendshipStatus(targetUserId: string, status: FriendshipStatus): void {
    const friendMap = this.getItem<Record<string, FriendshipStatus>>('friendships', {
      'user-amina': 'friends',
      'user-samuel': 'friends',
      'user-tendai': 'pending_received',
    });
    friendMap[targetUserId] = status;
    this.setItem('friendships', friendMap);
  }

  getFollowStatus(targetUserId: string): boolean {
    const followList = this.getItem<string[]>('following_ids', ['user-amina', 'user-samuel', 'user-thabo']);
    return followList.includes(targetUserId);
  }

  toggleFollow(targetUserId: string): boolean {
    const followList = this.getItem<string[]>('following_ids', ['user-amina', 'user-samuel', 'user-thabo']);
    const isFollowing = followList.includes(targetUserId);
    const updated = isFollowing
      ? followList.filter((id) => id !== targetUserId)
      : [...followList, targetUserId];
    this.setItem('following_ids', updated);
    return !isFollowing;
  }

  // Posts & Feed
  getPosts(cursor?: string, limit: number = 10, countryCode?: string, communityId?: string): { posts: Post[]; nextCursor: string | null; hasMore: boolean } {
    let posts = this.getItem<Post[]>('posts', INITIAL_POSTS);

    if (countryCode) {
      posts = posts.filter((p) => p.countryCode?.toUpperCase() === countryCode.toUpperCase());
    }
    if (communityId) {
      posts = posts.filter((p) => p.communityId === communityId);
    }

    // Sort by createdAt desc
    posts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const startIndex = cursor ? posts.findIndex((p) => p.id === cursor) + 1 : 0;
    const paginated = posts.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < posts.length;
    const nextCursor = hasMore && paginated.length > 0 ? paginated[paginated.length - 1].id : null;

    return { posts: paginated, nextCursor, hasMore };
  }

  createPost(data: {
    content: string;
    visibility: PostVisibility;
    media?: Array<{ type: 'image' | 'video'; url: string; caption?: string }>;
    communityId?: string;
  }): Post {
    const user = this.getCurrentUser();
    const posts = this.getItem<Post[]>('posts', INITIAL_POSTS);

    let communityName: string | undefined;
    if (data.communityId) {
      const comm = this.getCommunityById(data.communityId);
      communityName = comm?.name;
    }

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: user,
      content: data.content,
      visibility: data.visibility,
      countryCode: user.countryCode,
      communityId: data.communityId,
      communityName,
      createdAt: new Date().toISOString(),
      media: data.media?.map((m, idx) => ({
        id: `media-${Date.now()}-${idx}`,
        ...m,
      })),
      reactionsCount: { like: 0, love: 0, funny: 0, support: 0, sad: 0, angry: 0 },
      myReaction: null,
      commentsCount: 0,
      sharesCount: 0,
    };

    this.setItem('posts', [newPost, ...posts]);
    return newPost;
  }

  reactToPost(postId: string, reaction: ReactionType): Post | undefined {
    const posts = this.getItem<Post[]>('posts', INITIAL_POSTS);
    const post = posts.find((p) => p.id === postId);
    if (!post) return undefined;

    const previousReaction = post.myReaction;

    if (previousReaction === reaction) {
      // Toggle off
      post.reactionsCount[reaction] = Math.max(0, post.reactionsCount[reaction] - 1);
      post.myReaction = null;
    } else {
      if (previousReaction) {
        post.reactionsCount[previousReaction] = Math.max(0, post.reactionsCount[previousReaction] - 1);
      }
      post.reactionsCount[reaction] = (post.reactionsCount[reaction] || 0) + 1;
      post.myReaction = reaction;

      // Add notification for author if not reacting to own post
      const currentUser = this.getCurrentUser();
      if (post.author.id !== currentUser.id) {
        this.addNotification({
          type: 'reaction',
          actor: currentUser,
          targetId: post.id,
          targetSnippet: post.content.slice(0, 50),
          reactionType: reaction,
        });
      }
    }

    this.setItem('posts', posts);
    return post;
  }

  deletePost(postId: string): boolean {
    const posts = this.getItem<Post[]>('posts', INITIAL_POSTS);
    const filtered = posts.filter((p) => p.id !== postId);
    this.setItem('posts', filtered);
    return true;
  }

  // Comments
  getComments(postId: string): Comment[] {
    const allComments = this.getItem<Comment[]>('comments', INITIAL_COMMENTS);
    return allComments.filter((c) => c.postId === postId);
  }

  createComment(postId: string, content: string, parentId?: string | null): Comment {
    const user = this.getCurrentUser();
    const allComments = this.getItem<Comment[]>('comments', INITIAL_COMMENTS);

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      postId,
      parentId: parentId || null,
      author: user,
      content,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLikedByMe: false,
      replies: [],
    };

    if (parentId) {
      // Add as reply inside parent comment
      const parent = allComments.find((c) => c.id === parentId);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(newComment);
      }
    } else {
      allComments.unshift(newComment);
    }

    // Increment post comment count
    const posts = this.getItem<Post[]>('posts', INITIAL_POSTS);
    const post = posts.find((p) => p.id === postId);
    if (post) {
      post.commentsCount = (post.commentsCount || 0) + 1;
      this.setItem('posts', posts);

      if (post.author.id !== user.id) {
        this.addNotification({
          type: parentId ? 'comment_reply' : 'comment',
          actor: user,
          targetId: post.id,
          targetSnippet: content.slice(0, 50),
        });
      }
    }

    this.setItem('comments', allComments);
    return newComment;
  }

  // Communities
  getCommunities(): Community[] {
    return this.getItem<Community[]>('communities', INITIAL_COMMUNITIES);
  }

  getCommunityById(idOrSlug: string): Community | undefined {
    return this.getCommunities().find((c) => c.id === idOrSlug || c.slug === idOrSlug);
  }

  createCommunity(data: {
    name: string;
    description: string;
    category: string;
    country?: string;
    isPrivate: boolean;
    profileImage?: string;
    coverImage?: string;
    rules: string[];
  }): Community {
    const user = this.getCurrentUser();
    const communities = this.getCommunities();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newComm: Community = {
      id: `comm-${Date.now()}`,
      name: data.name,
      slug,
      description: data.description,
      category: data.category,
      country: data.country || 'Pan-African',
      profileImage: data.profileImage || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
      isPrivate: data.isPrivate,
      memberCount: 1,
      creatorId: user.id,
      moderatorIds: [user.id],
      rules: data.rules.length > 0 ? data.rules : ['Be respectful and courteous to all community members.'],
      isJoined: true,
      myRole: 'owner',
    };

    this.setItem('communities', [newComm, ...communities]);
    return newComm;
  }

  toggleJoinCommunity(communityId: string): boolean {
    const communities = this.getCommunities();
    const comm = communities.find((c) => c.id === communityId);
    if (!comm) return false;

    if (comm.isJoined) {
      comm.isJoined = false;
      comm.myRole = null;
      comm.memberCount = Math.max(0, comm.memberCount - 1);
    } else {
      comm.isJoined = true;
      comm.myRole = 'member';
      comm.memberCount += 1;
    }

    this.setItem('communities', communities);
    return comm.isJoined;
  }

  // Messaging
  getConversations(): Conversation[] {
    return this.getItem<Conversation[]>('conversations', INITIAL_CONVERSATIONS);
  }

  getMessages(conversationId: string): Message[] {
    const messages = this.getItem<Message[]>('messages', INITIAL_MESSAGES);
    return messages.filter((m) => m.conversationId === conversationId);
  }

  sendMessage(conversationId: string, content: string, mediaUrl?: string): Message {
    const user = this.getCurrentUser();
    const allMessages = this.getItem<Message[]>('messages', INITIAL_MESSAGES);

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: user.id,
      sender: user,
      content,
      mediaUrl,
      createdAt: new Date().toISOString(),
      isRead: true,
    };

    allMessages.push(newMessage);
    this.setItem('messages', allMessages);

    // Update conversation last message
    const conversations = this.getConversations();
    const conv = conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = newMessage;
      conv.updatedAt = newMessage.createdAt;
      this.setItem('conversations', conversations);
    }

    return newMessage;
  }

  // Notifications
  getNotifications(): Notification[] {
    return this.getItem<Notification[]>('notifications', INITIAL_NOTIFICATIONS);
  }

  getUnreadNotificationsCount(): number {
    return this.getNotifications().filter((n) => !n.isRead).length;
  }

  markNotificationAsRead(id: string): void {
    const notifs = this.getNotifications();
    const target = notifs.find((n) => n.id === id);
    if (target) {
      target.isRead = true;
      this.setItem('notifications', notifs);
    }
  }

  markAllNotificationsAsRead(): void {
    const notifs = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    this.setItem('notifications', notifs);
  }

  addNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification {
    const notifs = this.getNotifications();
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    this.setItem('notifications', [newNotif, ...notifs]);
    return newNotif;
  }

  // Moderation & Trust & Safety
  getReports(): Report[] {
    return this.getItem<Report[]>('reports', INITIAL_REPORTS);
  }

  submitReport(data: {
    targetType: Report['targetType'];
    targetId: string;
    targetPreview: string;
    category: Report['category'];
    details: string;
  }): Report {
    const user = this.getCurrentUser();
    const reports = this.getReports();

    const newReport: Report = {
      id: `rep-${Date.now()}`,
      reporterId: user.id,
      reporterName: user.fullName,
      targetType: data.targetType,
      targetId: data.targetId,
      targetPreview: data.targetPreview,
      category: data.category,
      details: data.details,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.setItem('reports', [newReport, ...reports]);
    return newReport;
  }

  resolveReport(reportId: string, action: 'resolve' | 'dismiss'): boolean {
    const reports = this.getReports();
    const rep = reports.find((r) => r.id === reportId);
    if (!rep) return false;
    rep.status = action === 'resolve' ? 'resolved' : 'dismissed';
    this.setItem('reports', reports);
    return true;
  }

  addReport(report: Report): Report {
    const reports = this.getReports();
    this.setItem('reports', [report, ...reports]);
    return report;
  }

  blockUser(targetUserId: string): boolean {
    const blockedList = this.getItem<string[]>('blocked_users', []);
    if (!blockedList.includes(targetUserId)) {
      blockedList.push(targetUserId);
      this.setItem('blocked_users', blockedList);
    }
    this.setFriendshipStatus(targetUserId, 'blocked');
    return true;
  }

  unblockUser(userId: string): boolean {
    const blockedList = this.getItem<string[]>('blocked_users', []).filter((id) => id !== userId);
    this.setItem('blocked_users', blockedList);
    this.setFriendshipStatus(userId, 'none');
    return true;
  }

  getBlockedUsers(): string[] {
    return this.getItem<string[]>('blocked_users', []);
  }

  // Admin Actions
  updateUserAccountStatus(userId: string, status: AccountStatus): boolean {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return false;
    user.status = status;
    this.setItem('users', users);
    return true;
  }
}

export const mockBackend = new AfriLinkBackendService();
