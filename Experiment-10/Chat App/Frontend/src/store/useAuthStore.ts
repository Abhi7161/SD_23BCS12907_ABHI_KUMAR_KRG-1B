import { create } from 'zustand';
import { axiosInstance } from '../lib/axiosInstance';
import toast from 'react-hot-toast';
import { generateKeyPair } from '../lib/encryption';

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
  token: string;
  publicKey?: string;
}

interface AuthStore {
  authUser: User | null;
  isLoggingIn: boolean;
  isSigningUp: boolean;
  login: (data: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  setAuthUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authUser: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!) : null,
  isLoggingIn: false,
  isSigningUp: false,

  setAuthUser: (user) => {
    if (user) {
      localStorage.setItem('userInfo', JSON.stringify(user));
    } else {
      localStorage.removeItem('userInfo');
    }
    set({ authUser: user });
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/user/login', data);
      let user = res.data;
      const existingPrivateKey = localStorage.getItem("privateKey");
      if (!existingPrivateKey) {
        const publicKey = await generateKeyPair();
        user.publicKey = publicKey;
        await axiosInstance.put('/user/update-key', { publicKey }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }

      set({ authUser: user });
      localStorage.setItem('userInfo', JSON.stringify(user));
      toast.success('Logged in successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      set({ isLoggingIn: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const publicKey = await generateKeyPair();
      data.publicKey = publicKey;

      const res = await axiosInstance.post('/user', data);
      set({ authUser: res.data });
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      toast.success('Account created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: () => {
    localStorage.removeItem('userInfo');
    set({ authUser: null });
    toast.success('Logged out successfully');
  },
}));
