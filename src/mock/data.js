// Centralized dummy/mock data for offline frontend demo mode.
// Keep shapes close to typical backend payloads.

export const mockAuthUser = {
  id: "u_1",
  name: "Alex Johnson",
  email: "alex@example.com",
  headline: "Senior Software Engineer at TechCorp",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=200&fit=crop",
  location: "San Francisco Bay Area",
  connections: 500,
};

export const mockProfile = {
  id: mockAuthUser.id,
  name: mockAuthUser.name,
  headline: mockAuthUser.headline,
  avatar: mockAuthUser.avatar,
  coverImage: mockAuthUser.coverImage,
  location: mockAuthUser.location,
  connections: mockAuthUser.connections,
  about:
    "Passionate software engineer with 5+ years of experience building scalable web applications.",
  experiences: [
    {
      id: "exp_1",
      title: "Senior Software Engineer",
      company: "TechCorp",
      logo: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=48&h=48&fit=crop",
      duration: "Jan 2022 - Present",
      location: "San Francisco, CA",
      description: "Leading frontend development team, architecting scalable solutions.",
    },
    {
      id: "exp_2",
      title: "Software Engineer",
      company: "StartupXYZ",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=48&h=48&fit=crop",
      duration: "Jun 2019 - Dec 2021",
      location: "New York, NY",
      description: "Built core product features using React and Node.js.",
    },
  ],
  skills: ["JavaScript", "React", "Node.js", "AWS", "Docker", "GraphQL"],
};

export const mockConnections = {
  items: [
    { id: "c_1", name: "Sarah Chen", headline: "Product Manager at Google", mutual: 12 },
    { id: "c_2", name: "Michael Torres", headline: "Engineering Lead at Meta", mutual: 8 },
  ],
};

export const mockFeed = {
  items: [
    {
      id: "p_1",
      author: {
        id: "u_2",
        name: "Jane Smith",
        headline: "CEO at StartupXYZ | Forbes 30 Under 30",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      },
      content:
        "Excited to announce that we've just closed our Series B funding round!\n\n#startup #funding #growth #tech",
      image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=500&fit=crop",
      likes: 1247,
      comments: 2,
      reposts: 34,
      timeAgo: "2h",
      commentItems: [
        {
          id: "cm_1",
          author: { name: "Emily Watson", avatar: "" },
          content: "Congrats! Huge milestone.",
          timeAgo: "1h",
        },
        {
          id: "cm_2",
          author: { name: "David Kim", avatar: "" },
          content: "Well deserved. Excited to see what’s next.",
          timeAgo: "45m",
        },
      ],
    },
    {
      id: "p_2",
      author: {
        id: "u_3",
        name: "David Chen",
        headline: "Senior Software Engineer at TechGiant",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      },
      // edge case: long content
      content:
        "Just shipped a major feature that improves page load times by 40%!\n\nKey learnings:\n• Always measure\n• Small optimizations compound\n• Code reviews matter\n• Documentation saves time\n\n".repeat(
          2
        ),
      image: null, // edge case: missing image
      likes: 892,
      comments: 0,
      reposts: 12,
      timeAgo: "4h",
      commentItems: [],
    },
    {
      id: "p_3",
      // edge case: missing author avatar/headline
      author: { id: "u_4", name: "Maria Garcia", headline: "", avatar: "" },
      content:
        "Design tip of the day: White space is not empty space - it's breathing room for your content.",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=500&fit=crop",
      likes: 2341,
      comments: 1,
      reposts: 78,
      timeAgo: "6h",
      commentItems: [
        { id: "cm_3", author: { name: "Alex Johnson", avatar: "" }, content: "Love this.", timeAgo: "2h" },
      ],
    },
  ],
};

export const mockJobs = {
  items: [
    {
      id: "j_1",
      title: "Senior Frontend Engineer",
      company: "TechCorp",
      logo: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=60&h=60&fit=crop",
      location: "San Francisco, CA",
      salary: "$150,000 - $200,000",
      posted: "2 days ago",
    },
    {
      id: "j_2",
      title: "Full Stack Developer",
      company: "StartupXYZ",
      logo: "", // edge case: missing logo
      location: "Remote",
      salary: "$120,000 - $160,000",
      posted: "1 week ago",
    },
    {
      id: "j_3",
      title: "React Developer",
      company: "DesignStudio",
      logo: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=60&h=60&fit=crop",
      location: "New York, NY",
      salary: "$100,000 - $140,000",
      posted: "3 days ago",
    },
  ],
};

export const mockNetworkSuggestions = {
  items: [
    {
      id: "s_1",
      name: "Sarah Chen",
      headline: "Product Manager at Google",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
      mutual: 12,
    },
    {
      id: "s_2",
      name: "Michael Torres",
      headline: "Engineering Lead at Meta",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      mutual: 8,
    },
    {
      id: "s_3",
      name: "Emily Watson",
      headline: "Senior Designer at Apple",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
      mutual: 5,
    },
  ],
};

export const mockConversations = {
  items: [
    {
      id: "m_1",
      name: "Sarah Chen",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      lastMessage: "Thanks for the recommendation!",
      time: "2m",
      unread: true,
    },
    {
      id: "m_2",
      name: "Michael Torres",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      lastMessage: "Let's schedule a call",
      time: "1h",
      unread: false,
    },
  ],
};

export const mockMessagesByConversationId = {
  m_1: {
    items: [
      { id: "msg_1", sender: "Sarah Chen", content: "Hi! I saw your recent post about React.", time: "10:30 AM" },
      { id: "msg_2", sender: "me", content: "Thanks! I’ve been researching optimization techniques.", time: "10:32 AM" },
      { id: "msg_3", sender: "Sarah Chen", content: "Thanks for the recommendation!", time: "10:40 AM" },
    ],
  },
  m_2: { items: [] }, // edge case: empty thread
};

export const mockNotifications = {
  items: [
    {
      id: "n_1",
      type: "connection",
      user: {
        name: "Sarah Chen",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      },
      action: "accepted your connection request",
      time: "2m ago",
      read: false,
    },
    {
      id: "n_2",
      type: "like",
      user: {
        name: "Michael Torres",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      },
      action: "liked your post about React performance",
      time: "1h ago",
      read: false,
    },
    {
      id: "n_3",
      type: "comment",
      user: {
        name: "Emily Watson",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      },
      action: "commented on your post",
      time: "3h ago",
      read: true,
    },
  ],
};

