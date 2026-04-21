import { create } from 'zustand';
import { axiosInstance } from '../lib/axiosInstance';
import toast from 'react-hot-toast';
import { encryptMessage, decryptMessage } from '../lib/encryption';
import { useAuthStore } from './useAuthStore';

interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: any[];
  latestMessage: any;
  groupAdmin: any;
}

interface Message {
  _id: string;
  sender: any;
  content: string;
  chat: any;
}

interface ChatStore {
  chats: Chat[];
  selectedChat: Chat | null;
  messages: Message[];
  isChatsLoading: boolean;
  isMessagesLoading: boolean;
  
  setSelectedChat: (chat: Chat | null) => void;
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (content: string, chatId: string) => Promise<any>;
  addMessage: (message: Message) => Promise<void>;
  accessChat: (userId: string) => Promise<void>;
  createGroupChat: (name: string, users: string[]) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  selectedChat: null,
  messages: [],
  isChatsLoading: false,
  isMessagesLoading: false,

  setSelectedChat: (chat) => set({ selectedChat: chat }),

  fetchChats: async () => {
    set({ isChatsLoading: true });
    try {
      const res = await axiosInstance.get('/chat');
      set({ chats: res.data });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch chats');
    } finally {
      set({ isChatsLoading: false });
    }
  },

  fetchMessages: async (chatId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${chatId}`);
      const selectedChat = get().selectedChat;
      const authUser = useAuthStore.getState().authUser;
      
      let processedMessages = res.data;

      if (selectedChat && !selectedChat.isGroupChat) {
        const otherUser = selectedChat.users.find((u: any) => u._id !== authUser?._id);
        if (otherUser && otherUser.publicKey) {
          processedMessages = await Promise.all(res.data.map(async (msg: any) => {
             const decryptedContent = await decryptMessage(msg.content, otherUser.publicKey);
             return { ...msg, content: decryptedContent };
          }));
        }
      }

      set({ messages: processedMessages });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch messages');
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (content, chatId) => {
    try {
      const selectedChat = get().selectedChat;
      let finalContent = content;
      
      if (selectedChat && !selectedChat.isGroupChat) {
        const authUser = useAuthStore.getState().authUser;
        const otherUser = selectedChat.users.find((u: any) => u._id !== authUser?._id);
        if (otherUser && otherUser.publicKey) {
          finalContent = await encryptMessage(content, otherUser.publicKey);
        }
      }

      const res = await axiosInstance.post('/message', { content: finalContent, chatId });
      const localMsg = { ...res.data, content }; // Keep plaintext for local display
      set({ messages: [...get().messages, localMsg] });
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message');
      return null;
    }
  },

  addMessage: async (message) => {
    const selectedChat = get().selectedChat;
    const authUser = useAuthStore.getState().authUser;
    let finalMessage = message;

    if (selectedChat && !selectedChat.isGroupChat && message.sender._id !== authUser?._id) {
       const otherUser = selectedChat.users.find((u: any) => u._id !== authUser?._id);
       if (otherUser && otherUser.publicKey) {
         const decryptedContent = await decryptMessage(message.content, otherUser.publicKey);
         finalMessage = { ...message, content: decryptedContent };
       }
    }
    set({ messages: [...get().messages, finalMessage] });
  },

  accessChat: async (userId) => {
    try {
      const res = await axiosInstance.post('/chat', { userId });
      const currentChats = get().chats;
      if (!currentChats.find((c) => c._id === res.data._id)) {
        set({ chats: [res.data, ...currentChats] });
      }
      set({ selectedChat: res.data });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to access chat');
    }
  },

  createGroupChat: async (name: string, users: string[]) => {
    try {
      const res = await axiosInstance.post('/chat/group', {
        name,
        users: JSON.stringify(users),
      });
      set({ chats: [res.data, ...get().chats], selectedChat: res.data });
      toast.success('Group Chat Created!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create Group Chat');
    }
  }
}));
