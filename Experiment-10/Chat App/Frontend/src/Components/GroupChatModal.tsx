import { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { axiosInstance } from '../lib/axiosInstance';
import toast from 'react-hot-toast';
import { X, Search } from 'lucide-react';

interface GroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GroupChatModal({ isOpen, onClose }: GroupChatModalProps) {
  const [groupChatName, setGroupChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { createGroupChat } = useChatStore();

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

  const handleGroup = (userToAdd: any) => {
    if (selectedUsers.includes(userToAdd)) {
      toast.error('User already added');
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser: any) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast.error('Please fill all the fields');
      return;
    }
    await createGroupChat(groupChatName, selectedUsers.map((u) => u._id));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50 transition-opacity">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Group Chat</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Chat Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            onChange={(e) => setGroupChatName(e.target.value)}
          />

          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Add Users eg: John, Jane"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((u) => (
              <span key={u._id} className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                {u.name}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => handleDelete(u)} />
              </span>
            ))}
          </div>

          {loading ? (
            <div className="text-center text-sm text-gray-500 py-4">Loading...</div>
          ) : (
            <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
              {searchResult?.slice(0, 4).map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleGroup(user)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                >
                  <img src={user.pic} alt={user.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <h3 className="text-sm font-semibold">{user.name}</h3>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition shadow-md mt-2"
          >
            Create Chat
          </button>
        </div>
      </div>
    </div>
  );
}
