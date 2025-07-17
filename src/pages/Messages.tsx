import { useState } from "react";
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Image } from "lucide-react";
import { Layout } from "@/components/Layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';
import { ReviewModal } from "@/components/ui/review-modal";

// Mock conversations data
const mockConversations = [
  {
    id: "1",
    user: {
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e2c8a6?w=150&h=150&fit=crop&crop=face",
      isOnline: true
    },
    lastMessage: "Great! I'll send you the design concepts by tomorrow.",
    timestamp: "2024-01-15T14:30:00Z",
    unreadCount: 2,
    isProvider: true
  },
  {
    id: "2",
    user: {
      name: "Ahmed Al-Rashid",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      isOnline: false
    },
    lastMessage: "The plumbing work is completed. Everything is working perfectly!",
    timestamp: "2024-01-15T12:15:00Z",
    unreadCount: 0,
    isProvider: true
  },
  {
    id: "3",
    user: {
      name: "Marie Dubois",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      isOnline: true
    },
    lastMessage: "When would be a good time to discuss the event details?",
    timestamp: "2024-01-15T09:45:00Z",
    unreadCount: 1,
    isProvider: true
  }
];

// Mock messages for a conversation
const mockMessages = [
  {
    id: "1",
    senderId: "2",
    content: "Hi! I saw your request for plumbing services. I can help you with that.",
    timestamp: "2024-01-15T10:00:00Z",
    type: "text"
  },
  {
    id: "2",
    senderId: "me",
    content: "Great! I need to fix a leaky faucet in my kitchen. When are you available?",
    timestamp: "2024-01-15T10:05:00Z",
    type: "text"
  },
  {
    id: "3",
    senderId: "2",
    content: "I can come today afternoon around 2 PM. Here's what the repair usually looks like:",
    timestamp: "2024-01-15T10:07:00Z",
    type: "text"
  },
  {
    id: "4",
    senderId: "2",
    content: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop",
    timestamp: "2024-01-15T10:08:00Z",
    type: "image"
  },
  {
    id: "5",
    senderId: "me",
    content: "Perfect! That's exactly what I need. What's your rate?",
    timestamp: "2024-01-15T10:10:00Z",
    type: "text"
  },
  {
    id: "6",
    senderId: "2",
    content: "AED 150 for this type of repair, including parts. Payment through the app.",
    timestamp: "2024-01-15T10:12:00Z",
    type: "text"
  }
];

export default function Messages() {
  const { t } = useTranslation();
  const [conversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobStatus, setJobStatus] = useState<"not_started" | "in_progress" | "completed">("not_started");
  const [showReviewModal, setShowReviewModal] = useState(false);

  const filteredConversations = conversations.filter(conversation =>
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return formatTime(timestamp);
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In real app, send message via API
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const handleJobAction = () => {
    if (jobStatus === "not_started") {
      setJobStatus("in_progress");
    } else if (jobStatus === "in_progress") {
      setJobStatus("completed");
      setShowReviewModal(true);
    }
  };

  const handleReviewSubmit = (rating: number, comment: string) => {
    console.log("Review submitted:", { rating, comment });
    // In real app, send review to API
  };

  if (selectedConversation) {
    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return null;

    return (
      <Layout title={t('messages')} showMobileNav={false}>
        {/* Chat Header */}
        <div className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedConversation(null)}
              >
                ←
              </Button>
              <Avatar className="w-10 h-10">
                <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">{conversation.user.name}</h3>
                <div className="flex items-center gap-2">
                  {conversation.user.isOnline && (
                    <>
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Online</span>
                    </>
                  )}
                  {conversation.isProvider && (
                    <Badge variant="secondary" className="text-xs">Provider</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Job Action Button */}
          {conversation.isProvider && (
            <div className="px-4 pb-3">
              <Button 
                onClick={handleJobAction}
                className={`w-full ${
                  jobStatus === "in_progress" 
                    ? "bg-orange-500 hover:bg-orange-600" 
                    : jobStatus === "completed"
                    ? "bg-green-500 hover:bg-green-600"
                    : ""
                }`}
                disabled={jobStatus === "completed"}
              >
                {jobStatus === "not_started" && t('startJob')}
                {jobStatus === "in_progress" && t('jobInProgress')}
                {jobStatus === "completed" && t('endJob')}
              </Button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-xl ${
                  message.senderId === "me"
                    ? "message-sent"
                    : "message-received"
                }`}
              >
                {message.type === "image" ? (
                  <img
                    src={message.content}
                    alt="Shared image"
                    className="rounded-lg max-w-full h-auto"
                  />
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                <p className={`text-xs mt-1 opacity-70`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Image className="w-4 h-4" />
            </Button>
            <Input
              placeholder={t('typeMessage')}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              size="sm"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
          providerName={conversation.user.name}
        />
      </Layout>
    );
  }

  return (
    <Layout title={t('messages')}>
      <div className="container-mobile space-y-4 py-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={t('searchConversations')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 rounded-xl"
          />
        </div>

        {/* Conversations */}
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className="post-card p-4 cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                    <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                  </Avatar>
                  {conversation.user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-card"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">{conversation.user.name}</h3>
                      {conversation.isProvider && (
                        <Badge variant="secondary" className="text-xs">Provider</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(conversation.timestamp)}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-primary text-primary-foreground min-w-5 h-5 text-xs flex items-center justify-center">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}