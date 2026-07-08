
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'client' | 'admin';
  chat_room_id: string;
  created_at: string;
  attachments?: Array<{name: string, url: string, size?: number, type?: string}>;
  context_type?: string;
}

interface ChatRoom {
  id: string;
  client_id: string;
  client_name: string;
  created_at: string;
  last_message_at: string;
}

export const useChat = (isAdmin = false) => {
  const { user: clientUser, client } = useAuth();
  const { user: adminUser, isAdminAuthenticated } = useAdminAuth();
  const { toast } = useToast();
  
  // Use admin user if admin, otherwise client user
  const user = isAdmin ? adminUser : clientUser;
  
  console.log('🔄 useChat hook initialized - user:', user?.id, 'client:', client?.id, 'isAdmin:', isAdmin, 'adminAuth:', isAdminAuthenticated);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadChatRooms = useCallback(async () => {
    if (!user) {
      console.log('⚠️ loadChatRooms: No user, skipping');
      return;
    }

    // Prevent multiple simultaneous calls
    if (loading) {
      console.log('⚠️ loadChatRooms: Already loading, skipping');
      return;
    }

    try {
      console.log('🔄 Loading chat rooms for user:', user.id, 'isAdmin:', isAdmin);
      setLoading(true);
      
      let query = supabase.from('chat_rooms').select('*');
      
      // Admins can see all rooms, clients only their own
      if (!isAdmin) {
        query = query.eq('client_id', user.id);
      }
      
      const { data, error } = await query.order('last_message_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error loading chat rooms:', error);
        throw error;
      }
      
      console.log('✅ Chat rooms loaded:', data?.length || 0, 'rooms');
      setRooms(data || []);
    } catch (error) {
      console.error('❌ Exception in loadChatRooms:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar salas de chat",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, toast]); // Removed loading from dependencies

  // Carregar mensagens de uma sala
  const loadMessages = useCallback(async (roomId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Type assertion to ensure correct typing
      const typedMessages = (data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'client' | 'admin'
      }));
      
      setMessages(typedMessages);
      setCurrentRoom(roomId);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens do chat",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Criar ou encontrar sala de chat para cliente
  const createOrFindRoom = useCallback(async () => {
    if (!user || !client || isAdmin) {
      console.log('⚠️ createOrFindRoom: Missing requirements - user:', !!user, 'client:', !!client, 'isAdmin:', isAdmin);
      return null;
    }

    try {
      console.log('🔄 Creating/finding room for user:', user.id);
      // Verificar se já existe uma sala para este cliente
      const { data: existingRoom, error: findError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('client_id', user.id)
        .maybeSingle(); // Changed to maybeSingle to avoid errors when no room exists

      if (findError) {
        console.error('❌ Error finding existing room:', findError);
        throw findError;
      }

      if (existingRoom) {
        console.log('✅ Found existing room:', existingRoom.id);
        setCurrentRoom(existingRoom.id);
        return existingRoom.id;
      }

      console.log('🔄 Creating new room for client:', client.name);
      // Criar nova sala
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
          client_id: user.id,
          client_name: client.name || user.email?.split('@')[0] || 'Cliente'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating room:', createError);
        throw createError;
      }
      
      console.log('✅ New room created:', newRoom.id);
      await loadChatRooms();
      setCurrentRoom(newRoom.id);
      return newRoom.id;
    } catch (error) {
      console.error('❌ Exception in createOrFindRoom:', error);
      return null;
    }
  }, [user, client, isAdmin, loadChatRooms]);

  // Enviar mensagem
  const sendMessage = useCallback(async (content: string, roomId?: string, attachments?: any[], contextType?: string) => {
    if (!user || (!content.trim() && (!attachments || attachments.length === 0))) {
      console.log('⚠️ sendMessage: Invalid user, content or attachments');
      return false;
    }

    try {
      console.log('📤 Sending message:', content.substring(0, 50), 'attachments:', attachments?.length || 0);
      setSending(true);
      
      let targetRoomId = roomId || currentRoom;
      
      // Se não há sala atual e não é admin, criar uma
      if (!targetRoomId && !isAdmin) {
        console.log('🔄 Creating room before sending message');
        targetRoomId = await createOrFindRoom();
        if (!targetRoomId) {
          console.error('❌ Failed to create chat room');
          throw new Error('Não foi possível criar sala de chat');
        }
      }

      if (!targetRoomId) {
        console.error('❌ No target room available');
        throw new Error('Nenhuma sala selecionada');
      }

      console.log('📤 Inserting message into room:', targetRoomId);
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          content: content.trim(),
          sender_id: user.id,
          sender_name: isAdmin ? 'Suporte' : (client?.name || user.email?.split('@')[0] || 'Cliente'),
          sender_type: isAdmin ? 'admin' : 'client',
          chat_room_id: targetRoomId,
          attachments: attachments || [],
          context_type: contextType || null
        });

      if (error) {
        console.error('❌ Database insert error:', error);
        throw error;
      }
      
      console.log('✅ Message sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive"
      });
      return false;
    } finally {
      setSending(false);
    }
  }, [user, client, currentRoom, isAdmin, createOrFindRoom, toast]);

  // Upload de anexo
  const uploadAttachment = useCallback(async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${user?.id || 'anonymous'}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);
        
      return {
        name: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast({
        title: "Erro no upload",
        description: "Erro ao fazer upload do anexo.",
        variant: "destructive"
      });
      throw error;
    }
  }, [user, toast]);

  // Configurar realtime - properly manage subscriptions
  useEffect(() => {
    let channel: any = null;
    
    if (user && currentRoom) {
      console.log('🔄 Setting up realtime for user:', user.id, 'room:', currentRoom, 'isAdmin:', isAdmin);
      
      const channelName = `chat-room-${currentRoom}-${Date.now()}`;
      
      channel = supabase
        .channel(channelName)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages',
            filter: `chat_room_id=eq.${currentRoom}`
          }, 
          (payload) => {
            const newMessage = payload.new as any;
            console.log('📨 New message received via realtime:', newMessage);
            
            if (newMessage.chat_room_id === currentRoom) {
              setMessages(prev => {
                const exists = prev.some(msg => msg.id === newMessage.id);
                if (exists) {
                  console.log('📨 Message already exists, skipping');
                  return prev;
                }
                
                console.log('📨 Adding new message to state');
                return [...prev, {
                  ...newMessage,
                  sender_type: newMessage.sender_type as 'client' | 'admin'
                }];
              });
            }
          }
        )
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public', 
            table: 'chat_rooms',
            filter: `id=eq.${currentRoom}`
          },
          (payload) => {
            console.log('📨 Chat room updated:', payload.new);
          }
        )
        .subscribe((status) => {
          console.log('📡 Realtime channel status:', status, 'for room:', currentRoom);
        });
    }

    return () => {
      if (channel) {
        console.log('🧹 Cleaning up realtime subscriptions for room:', currentRoom);
        supabase.removeChannel(channel);
      }
    };
  }, [currentRoom, user?.id, isAdmin]); // Depend on currentRoom and user ID

  // Load rooms separately
  useEffect(() => {
    if (user && !loading) {
      console.log('🔄 Loading chat rooms for user:', user.id);
      loadChatRooms();
    }
  }, [user]); // Only run once when user changes


  return {
    messages,
    rooms,
    currentRoom,
    loading,
    sending,
    loadMessages,
    sendMessage,
    uploadAttachment,
    createOrFindRoom,
    setCurrentRoom
  };
};
