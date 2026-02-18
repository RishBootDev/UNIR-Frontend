import { Navbar } from "@/components/Navbar/Navbar";
import { useAuth } from "@/context/useAuth";
import { useLocation } from "react-router-dom";
import { Search, Edit, Image, Send, Video, Users } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { getUserId } from "@/auth/authStorage";
import VideoCall from "@/components/Messaging/VideoCall";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { InlineError } from "@/components/ui/InlineError";
import { Skeleton } from "@/components/ui/Skeleton";
import { networkService, profileService } from "@/services/api";

const GHOST_AVATAR = "https://static.licdn.com/aero-v1/networks/ghost-finder/ghost-person.612aaaff.png";

export default function MessagingPage() {
  const { user } = useAuth();
  const location = useLocation();
  const { conversations, loading: convLoading, error: convError, isEmpty: convEmpty, refetch: refetchConvs } =
    useConversations();

  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const socketRef = useRef(null);

  // Connections & search state
  const [connections, setConnections] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Load connections on mount (same API as My Network)
  useEffect(() => {
    const loadConnections = async () => {
      try {
        setConnectionsLoading(true);
        const data = await networkService.getMyConnections();
        if (data && data.length > 0) {
          const enriched = await Promise.all(data.map(async (p) => {
            try {
              const profile = await profileService.getProfileById(p.userId);
              return {
                ...p,
                ...profile,
                firstName: profile.firstName,
                lastName: profile.lastName,
                headline: profile.headline || "Member",
                profilePictureUrl: profile.profilePictureUrl
              };
            } catch (e) {
              const names = (p.name || "").split(" ");
              return {
                ...p,
                firstName: names[0] || "Unknown",
                lastName: names.slice(1).join(" ") || "",
                headline: "Member"
              };
            }
          }));
          setConnections(enriched);
        } else {
          setConnections([]);
        }
      } catch (err) {
        console.error("Failed to load connections for messaging", err);
      } finally {
        setConnectionsLoading(false);
      }
    };
    loadConnections();
  }, []);

  // Debounced people search (same API as Find People in NetworkPage)
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await profileService.getProfilesByName(searchQuery);
        setSearchResults(results || []);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Setup socket connection for incoming calls
  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    // Connect to video service
    socketRef.current = io({ 
      path: "/api/unir/video/socket.io",
      auth: { id: String(userId), name: user?.name || "User" }, 
    });

    // Listen for incoming calls
    socketRef.current.on("call:incoming", ({ callerId, callerName }) => {
      console.log("Incoming call from:", callerId, callerName);
      setIncomingCall({ callerId, callerName });
      setShowVideoCall(true);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  // Handle direct navigation to a user
  useEffect(() => {
    if (location.state?.selectedUser?.userId) {
        setSelectedConversationId(location.state.selectedUser.userId);
    }
  }, [location.state]);

  // Select a person (from connections or search) to chat with
  const handleSelectPerson = (person) => {
    setSelectedConversationId(person.userId);
    setSearchQuery("");
    setSearchResults([]);
  };

  const selectedConversation = useMemo(() => {
    if (selectedConversationId) {
        // Check existing conversations
        const existing = conversations?.find(c => c.id === selectedConversationId);
        if (existing) return existing;
        
        // Check connections
        const conn = connections.find(c => c.userId === selectedConversationId);
        if (conn) {
            return {
                id: conn.userId,
                name: `${conn.firstName} ${conn.lastName}`,
                avatar: conn.profilePictureUrl || GHOST_AVATAR,
                time: "New",
                unread: false
            };
        }

        // Check search results
        const searched = searchResults.find(s => s.userId === selectedConversationId);
        if (searched) {
            return {
                id: searched.userId,
                name: `${searched.firstName} ${searched.lastName}`,
                avatar: searched.profilePictureUrl || GHOST_AVATAR,
                time: "New",
                unread: false
            };
        }

        // If not in existing conversations, checks if it was passed via state
        if (location.state?.selectedUser?.userId === selectedConversationId) {
            const u = location.state.selectedUser;
            return {
                id: u.userId,
                name: `${u.firstName} ${u.lastName}`,
                avatar: u.profilePictureUrl || u.avatar || "",
                time: "New",
                unread: false
            };
        }
    }
    
    if (!conversations || conversations.length === 0) return null;
    return conversations[0] ?? null;
  }, [conversations, connections, searchResults, selectedConversationId, location.state]);

  const {
    messages,
    loading: msgLoading,
    error: msgError,
    isEmpty: msgEmpty,
    refetch: refetchMessages,
    send,
  } = useMessages(selectedConversation?.id);

  const handleSend = () => {
    if (messageText.trim()) {
      void send(messageText.trim());
      setMessageText("");
    }
  };

  // Determine what to show in sidebar
  const isSearchActive = searchQuery.trim().length >= 2;

  // Merge conversations and connections (conversations first, then connections not already listed)
  const mergedSidebarList = useMemo(() => {
    if (isSearchActive) return [];

    // Conversation IDs for dedup
    const convIds = new Set((conversations || []).map(c => c.id));

    // Connections not already in conversations
    const extraConnections = connections.filter(c => !convIds.has(c.userId));

    return { conversations: conversations || [], extraConnections };
  }, [conversations, connections, isSearchActive]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-[52px]">
        <div className="max-w-[1128px] mx-auto px-4 py-6">
          <div className="unir-card flex flex-col md:flex-row md:h-[calc(100vh-120px)] overflow-hidden">
            <div className="w-full md:w-[320px] md:border-r border-[rgba(0,0,0,0.08)] flex flex-col">
              <div className="p-4 border-b border-[rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-lg font-semibold text-[rgba(0,0,0,0.9)]">Messaging</h1>
                  <button className="p-2 hover:bg-[rgba(0,0,0,0.04)] rounded-full">
                    <Edit className="w-5 h-5 text-[rgba(0,0,0,0.6)]" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,0,0,0.6)]" />
                  <input
                    type="text"
                    placeholder="Search people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#eef3f8] rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {/* Search results label */}
                {isSearchActive && (
                  <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    {searching ? "Searching..." : `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} found`}
                  </div>
                )}

                {/* Search empty state */}
                {isSearchActive && !searching && searchResults.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm">No results for "{searchQuery}"</p>
                  </div>
                )}

                {/* Search results list */}
                {isSearchActive && searchResults.map((person) => (
                  <div
                    key={person.userId}
                    onClick={() => handleSelectPerson(person)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      selectedConversationId === person.userId ? "bg-[#e7f3ff]" : "hover:bg-[rgba(0,0,0,0.04)]"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img src={person.profilePictureUrl || GHOST_AVATAR} alt={person.firstName} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[rgba(0,0,0,0.9)] truncate">{person.firstName} {person.lastName}</p>
                      <p className="text-xs text-[rgba(0,0,0,0.5)] truncate">{person.headline || "Member"}</p>
                    </div>
                  </div>
                ))}

                {/* === Non-search: Conversations + Connections === */}
                {!isSearchActive && (
                  <>
                    {/* Loading skeletons */}
                    {(connectionsLoading || convLoading) &&
                      Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3">
                          <Skeleton className="w-12 h-12 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-3 w-44 mt-2" />
                          </div>
                        </div>
                      ))}

                    {/* Conversations section */}
                    {!convLoading && mergedSidebarList.conversations.length > 0 && (
                      <>
                        <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          Recent Chats ({mergedSidebarList.conversations.length})
                        </div>
                        {mergedSidebarList.conversations.map((conv) => (
                          <div
                            key={`conv-${conv.id}`}
                            onClick={() => setSelectedConversationId(conv.id)}
                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                              selectedConversationId === conv.id ? "bg-[#e7f3ff]" : "hover:bg-[rgba(0,0,0,0.04)]"
                            }`}
                          >
                            <div className="relative flex-shrink-0">
                              <img src={conv.avatar || GHOST_AVATAR} alt={conv.name} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                              {conv.unread && (
                                <span className="absolute top-0 right-0 w-3 h-3 bg-[#0a66c2] rounded-full border-2 border-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between">
                                <p className="font-semibold text-sm text-[rgba(0,0,0,0.9)] truncate">{conv.name}</p>
                                <span className="text-[10px] text-[rgba(0,0,0,0.4)] flex-shrink-0 ml-2">{conv.time}</span>
                              </div>
                              <p className="text-xs text-[rgba(0,0,0,0.5)] truncate">{conv.lastMessage || "Start chatting"}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Connections section (only those not already in conversations) */}
                    {!connectionsLoading && mergedSidebarList.extraConnections.length > 0 && (
                      <>
                        <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          Connections ({mergedSidebarList.extraConnections.length})
                        </div>
                        {mergedSidebarList.extraConnections.map((person) => (
                          <div
                            key={`conn-${person.userId}`}
                            onClick={() => handleSelectPerson(person)}
                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                              selectedConversationId === person.userId ? "bg-[#e7f3ff]" : "hover:bg-[rgba(0,0,0,0.04)]"
                            }`}
                          >
                            <div className="relative flex-shrink-0">
                              <img src={person.profilePictureUrl || GHOST_AVATAR} alt={person.firstName} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-[rgba(0,0,0,0.9)] truncate">{person.firstName} {person.lastName}</p>
                              <p className="text-xs text-[rgba(0,0,0,0.5)] truncate">{person.headline || "Member"}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Empty state - no conversations and no connections */}
                    {!connectionsLoading && !convLoading && mergedSidebarList.conversations.length === 0 && mergedSidebarList.extraConnections.length === 0 && (
                      <div className="p-6 text-center text-gray-500">
                        <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm">No conversations or connections yet.</p>
                        <p className="text-xs text-gray-400 mt-1">Search for people above to start a conversation.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <div className="p-4 border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedConversation.avatar}
                      alt={selectedConversation.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-[rgba(0,0,0,0.9)]">{selectedConversation.name}</p>
                      <p className="text-xs text-[rgba(0,0,0,0.6)]">Online</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowVideoCall(true)}
                    className="p-2 hover:bg-[rgba(0,0,0,0.04)] rounded-full text-gray-600 hover:text-blue-600 transition-colors"
                    title="Start Video Call"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="p-4 border-b border-[rgba(0,0,0,0.08)]">
                  <p className="text-sm text-[rgba(0,0,0,0.6)]">Select a conversation to start chatting.</p>
                </div>
              )}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {msgError && (
                  <InlineError
                    title="Couldn't load messages"
                    message={msgError?.message || "Please try again."}
                    onRetry={refetchMessages}
                  />
                )}
                {msgLoading && (
                  <>
                    <Skeleton className="h-9 w-64 rounded-lg" />
                    <Skeleton className="h-9 w-56 rounded-lg ml-auto" />
                    <Skeleton className="h-9 w-72 rounded-lg" />
                  </>
                )}
                {msgEmpty && !msgLoading && (
                  <div className="text-sm text-[rgba(0,0,0,0.6)]">No messages yet. Say hi!</div>
                )}
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`px-4 py-2 rounded-lg max-w-[70%] ${
                        message.sender === "me" ? "bg-[#0a66c2] text-white" : "bg-[#f2f2f2] text-[rgba(0,0,0,0.9)]"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-[rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-[rgba(0,0,0,0.04)] rounded-full">
                    <Image className="w-5 h-5 text-[rgba(0,0,0,0.6)]" />
                  </button>
                  <input
                    type="text"
                    placeholder={`Write a message${user?.name ? `, ${user.name}` : ""}...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1 px-4 py-2 bg-[#f2f2f2] rounded-full text-sm focus:outline-none"
                    disabled={!selectedConversation}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!selectedConversation || !messageText.trim()}
                    className="p-2 hover:bg-[rgba(0,0,0,0.04)] rounded-full disabled:opacity-50"
                  >
                    <Send className="w-5 h-5 text-[#0a66c2]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showVideoCall && (
        <VideoCall 
            activeCall={incomingCall ? null : { receiverId: selectedConversation?.id }} 
            onClose={() => {
              setShowVideoCall(false);
              setIncomingCall(null);
            }}
            isIncoming={!!incomingCall}
            callerInfo={incomingCall}
        />
      )}
    </div>
  );
}
