import { useState, useEffect } from "react";
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Image } from "lucide-react";
import { Layout } from "@/components/Layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';
import { ReviewModal } from "@/components/ui/review-modal";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { JobManager } from "@/components/JobManager";

export default function Messages() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobStatus, setJobStatus] = useState<"not_started" | "in_progress" | "completed">("not_started");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    const userParam = searchParams.get('user');
    if (userParam && user) { handleStartConversation(userParam); }
  }, [searchParams, user]);

  const fetchConversations = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data: messagesData, error } = await supabase.from('messages').select('*')
        .or(`sender_id.eq.${authUser.id},receiver_id.eq.${authUser.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const conversationMap = new Map();
      const partnerIds = new Set<string>();
      messagesData?.forEach(message => {
        const partnerId = message.sender_id === authUser.id ? message.receiver_id : message.sender_id;
        partnerIds.add(partnerId);
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, { id: partnerId, lastMessage: message.content, timestamp: message.created_at, unreadCount: 0 });
        }
      });
      if (partnerIds.size > 0) {
        const { data: profiles } = await supabase.from('profiles').select('user_id, name, avatar_url, is_provider').in('user_id', Array.from(partnerIds));
        const convs = Array.from(conversationMap.entries()).map(([partnerId, conv]) => {
          const profile = profiles?.find(p => p.user_id === partnerId);
          return { ...conv, user: { name: profile?.name || 'Unknown User', avatar: profile?.avatar_url, isOnline: false }, isProvider: profile?.is_provider || false };
        });
        setConversations(convs);
      } else { setConversations([]); }
    } catch (error) { console.error('Error fetching conversations:', error); }
    finally { setLoading(false); }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('messages').select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${conversationId}),and(sender_id.eq.${conversationId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) { console.error('Error fetching messages:', error); }
  };

  const filteredConversations = conversations.filter(c => c.user.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const formatTime = (timestamp: string) => new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return formatTime(timestamp);
    if (date.toDateString() === yesterday.toDateString()) return t('yesterday');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { error } = await supabase.from('messages').insert({ sender_id: user.id, receiver_id: selectedConversation, content: newMessage.trim() });
        if (error) throw error;
        setNewMessage(""); fetchMessages(selectedConversation);
      } catch (error) { console.error('Error sending message:', error); }
    }
  };

  const handleJobAction = () => {
    if (jobStatus === "not_started") setJobStatus("in_progress");
    else if (jobStatus === "in_progress") { setJobStatus("completed"); setShowReviewModal(true); }
  };

  const handleStartConversation = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
      if (error) throw error;
      setSelectedProfile(profile);
      setSelectedConversation(userId);
      setMessages([]);
      fetchMessages(userId);
    } catch (error) { console.error('Error starting conversation:', error); }
  };

  const handleReviewSubmit = (rating: number, comment: string) => {
    console.log("Review submitted:", { rating, comment });
  };

  if (selectedConversation) {
    const conversation = conversations.find(c => c.id === selectedConversation) || {
      id: selectedConversation,
      user: { name: selectedProfile?.name || 'Unknown User', avatar: selectedProfile?.avatar_url, isOnline: false },
      isProvider: selectedProfile?.is_provider || false,
      lastMessage: '', timestamp: new Date().toISOString(), unreadCount: 0
    };
    if (messages.length === 0) fetchMessages(selectedConversation);

    return (
      <Layout title={t('messages')} showMobileNav={false}>
        <div className="flex flex-col h-[calc(100vh-56px)] md:h-screen max-w-2xl mx-auto w-full">
          <div className="flex-shrink-0 z-40 bg-background border-b border-border">
            <div className="flex items-center justify-between p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)} className="flex-shrink-0">←</Button>
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                  <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                  <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate cursor-pointer hover:underline"
                    onClick={(e) => { e.stopPropagation(); navigate(`/profile?user=${conversation.id}`); }}>{conversation.user.name}</h3>
                  <div className="flex items-center gap-2">
                    {conversation.user.isOnline && (<><div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div><span className="text-xs text-muted-foreground">{t('online')}</span></>)}
                    {conversation.isProvider && <Badge variant="secondary" className="text-xs hidden sm:inline-flex">{t('provider')}</Badge>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="sm" className="hidden sm:flex"><Phone className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" className="hidden sm:flex"><Video className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </div>
            {conversation.isProvider && (
              <div className="px-3 sm:px-4 pb-3">
                <Button onClick={handleJobAction} className={`w-full text-sm sm:text-base ${jobStatus === "in_progress" ? "bg-orange-500 hover:bg-orange-600" : jobStatus === "completed" ? "bg-green-500 hover:bg-green-600" : ""}`} disabled={jobStatus === "completed"}>
                  {jobStatus === "not_started" && t('startJob')}
                  {jobStatus === "in_progress" && t('jobInProgress')}
                  {jobStatus === "completed" && t('endJob')}
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[280px] sm:max-w-xs px-3 sm:px-4 py-2 rounded-xl ${message.sender_id === user?.id ? 'bg-primary text-primary-foreground ml-12' : 'bg-muted mr-12'}`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">{formatTime(message.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('noMessagesYet')}</p>
                <p className="text-sm text-muted-foreground mt-2">{t('startConversation')}</p>
              </div>
            )}
          </div>

          {selectedProfile && <JobManager otherUserId={selectedProfile.user_id} otherUserName={selectedProfile.name} />}

          <div className="flex-shrink-0 bg-background border-t border-border p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="hidden sm:flex"><Paperclip className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex"><Image className="w-4 h-4" /></Button>
              <Input placeholder={t('typeMessage')} value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()} className="flex-1 text-sm sm:text-base" />
              <Button size="sm" onClick={handleSendMessage} disabled={!newMessage.trim()} className="flex-shrink-0"><Send className="w-4 h-4" /></Button>
            </div>
          </div>

          <ReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} onSubmit={handleReviewSubmit} providerName={conversation.user.name} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t('messages')}>
      <div className="w-full max-w-2xl mx-auto px-4 space-y-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder={t('searchConversations')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 h-12 rounded-xl" />
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div key={conversation.id}
                onClick={() => { setSelectedConversation(conversation.id); setSelectedProfile({ user_id: conversation.id, name: conversation.user.name, avatar_url: conversation.user.avatar, is_provider: conversation.isProvider }); setMessages([]); }}
                className="post-card p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12"><AvatarImage src={conversation.user.avatar} alt={conversation.user.name} /><AvatarFallback>{conversation.user.name[0]}</AvatarFallback></Avatar>
                    {conversation.user.isOnline && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-card"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm truncate">{conversation.user.name}</h3>
                        {conversation.isProvider && <Badge variant="secondary" className="text-xs">{t('provider')}</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{formatDate(conversation.timestamp)}</span>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-primary text-primary-foreground min-w-5 h-5 text-xs flex items-center justify-center">{conversation.unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('noConversationsYet')}</p>
              <p className="text-sm text-muted-foreground mt-2">{t('startChatting')}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
