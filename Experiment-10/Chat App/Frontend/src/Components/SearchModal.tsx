import { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { axiosInstance } from '../lib/axiosInstance';
import toast from 'react-hot-toast';
import { X, Search } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { accessChat } = useChatStore();

  if (!isOpen) return null;

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/user?search=${query}`);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast.error('Failed to load search results');
      setLoading(false);
    }
  };

  const handleAccessChat = async (userId: string) => {
    await accessChat(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50 transition-opacity">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Start New Chat</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </div>

          {loading ? (
            <div className="text-center text-sm text-gray-500 py-4">Searching...</div>
          ) : (
            <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
              {searchResult?.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleAccessChat(user._id)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                >
                  <img src={user.pic} alt={user.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <h3 className="text-sm font-semibold">{user.name}</h3>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              ))}
              {!loading && search && searchResult.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-4">No users found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
