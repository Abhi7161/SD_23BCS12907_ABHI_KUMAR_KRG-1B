import { Moon, LogOut, Search } from "lucide-react";
import Discussions from "./Discussions";
import ButtonComp from "./ButtonComp";
import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import GroupChatModal from "./GroupChatModal";
import SearchModal from "./SearchModal";

function LeftSideBar() {
  const { chats, fetchChats, selectedChat, setSelectedChat } = useChatStore();
  const { logout, authUser } = useAuthStore();
  
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const getChatName = (chat: any) => {
    if (chat.isGroupChat) return chat.chatName;
    const otherUser = chat.users.find((u: any) => u._id !== authUser?._id);
    return otherUser?.name || "Unknown";
  };

  return (
    <>
      <div className="h-screen w-[22vw] bg-gray-50 border-r flex flex-col shadow-sm z-10">
        {/* Top Bar */}
        <div className="h-[8vh] px-4 flex items-center justify-between bg-white border-b">
          <div className="flex items-center gap-3">
            <img src={authUser?.pic} alt="Profile" className="w-9 h-9 rounded-full shadow-sm" />
            <h1 className="text-base font-bold text-gray-800 truncate">{authUser?.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div 
              className="p-1.5 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition"
              onClick={() => setIsSearchModalOpen(true)}
              title="Search Users"
            >
              <Search className="w-4 h-4 text-gray-600" />
            </div>
            <div 
              className="p-1.5 bg-red-50 rounded-full cursor-pointer hover:bg-red-100 transition"
              onClick={logout}
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="px-4 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Messages</h2>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
            {chats.length}
          </span>
        </div>

        {/* Discussions List */}
        <div className="p-2 flex-1 overflow-y-auto space-y-1">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <Discussions
                key={chat._id}
                chatStatus={chat.isGroupChat ? "public" : "private"}
                chatName={getChatName(chat)}
                scount={chat.isGroupChat ? `${chat.users.length} members` : "Private"}
                notification={0}
                isSelected={selectedChat?._id === chat._id}
                onClick={() => setSelectedChat(chat)}
              />
            ))
          ) : (
            <div className="text-center text-sm text-gray-400 mt-10 px-4">
              No chats yet. Click the search icon above to find someone to chat with!
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white border-t">
          <ButtonComp 
            text="+ Create Group" 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl shadow-sm border-none"
            onClick={() => setIsGroupModalOpen(true)}
          />
        </div>
      </div>

      <GroupChatModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
}

export default LeftSideBar;
