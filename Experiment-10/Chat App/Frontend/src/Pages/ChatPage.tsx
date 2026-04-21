import LeftSideBar from "../Components/leftSideBar";
import ChatIcons from "../Components/ChatIcons";
import GreenButton from "../Components/GreenButton";
import DropBoxFiles from "../Components/DropBoxFiles";

import { useState, useEffect, useRef } from "react";
import {
  EllipsisVertical,
  Paperclip,
  Smile,
  Send,
  Activity,
  Lock,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";
let socket: any;

function ChatPage() {
  const [showDropBox, setShowDropBox] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  
  const { authUser } = useAuthStore();
  const { selectedChat, fetchMessages, messages, sendMessage, addMessage } = useChatStore();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authUser) {
      socket = io(ENDPOINT);
      socket.emit("setup", authUser);
      socket.on("connected", () => setSocketConnected(true));

      socket.on("message recieved", (newMessageRecieved: any) => {
        if (!selectedChat || selectedChat._id !== newMessageRecieved.chat._id) {
          // Notify here if needed
        } else {
          addMessage(newMessageRecieved);
        }
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [authUser, selectedChat, addMessage]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      socket.emit("join chat", selectedChat._id);
    }
  }, [selectedChat, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (socketConnected && socket) {
      const interval = setInterval(() => {
        const start = Date.now();
        socket.emit("ping_latency", () => {
          setLatency(Date.now() - start);
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [socketConnected]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChat) {
      const msgText = newMessage;
      setNewMessage(""); // clear input early for responsive UI

      const createdMessage = await sendMessage(msgText, selectedChat._id);
      
      if (createdMessage) {
        socket.emit("new message", createdMessage);
      }
    }
  };

  const getChatName = (chat: any) => {
    if (chat.isGroupChat) return chat.chatName;
    const otherUser = chat.users.find((u: any) => u._id !== authUser?._id);
    return otherUser?.name || "Unknown";
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <LeftSideBar />

      {/* Main Content */}
      <div className="flex flex-col w-full h-screen">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="flex items-start gap-2 px-4 py-4 h-[10vh]">
              <ChatIcons
                chatStatus={selectedChat.isGroupChat ? "public" : "private"}
                className="w-10 h-10 [&>svg]:text-black"
              />

              {/* Title + Buttons */}
              <div className="-mt-1.5 flex-1">
                <div className="flex gap-1.5 items-center">
                  <h1 className="text-lg font-semibold flex items-center gap-2">
                    {getChatName(selectedChat)}
                    {!selectedChat.isGroupChat && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                        <Lock className="w-3 h-3" /> E2EE
                      </span>
                    )}
                  </h1>
                </div>

                <div className="flex gap-1 mt-1">
                  {selectedChat.isGroupChat && <GreenButton />}
                </div>
              </div>

              {/* Menu */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200">
                  <Activity className="w-4 h-4 text-green-500" />
                  {latency !== null ? `${latency}ms` : '---'}
                </div>
                <EllipsisVertical className="w-6 h-6 cursor-pointer text-gray-500 hover:text-black transition mt-1" />
              </div>
            </div>

            {/* Top Divider */}
            <hr className="border-t border-gray-300 w-full" />

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50 h-[80vh]">
              {messages.map((msg, idx) => {
                const isMe = msg.sender._id === authUser?._id;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-xl ${isMe ? 'bg-green-500 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'}`}>
                      {!isMe && selectedChat.isGroupChat && (
                        <span className="text-xs font-bold text-gray-500 block mb-1">{msg.sender.name}</span>
                      )}
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="w-full h-[10vh] bg-white">
              <hr className="border-t border-gray-300 w-full" />

              <div className="w-full h-full flex items-center px-4 gap-3">
                {/* Left Icons */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div
                      className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition"
                      onClick={() => setShowDropBox(!showDropBox)}
                    >
                      <Paperclip className="w-5 h-5 text-gray-600" />
                    </div>
                    {showDropBox && <DropBoxFiles />}
                  </div>

                  <div className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition">
                    <Smile className="w-5 h-5 text-gray-600" />
                  </div>
                </div>

                {/* Input */}
                <div className="flex-1 h-10 border border-gray-300 rounded-2xl px-4 flex items-center bg-gray-50">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="w-full h-full outline-none bg-transparent"
                  />
                </div>

                {/* Send */}
                <div 
                  className="cursor-pointer p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
                  onClick={handleSendMessage}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Smile className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Chat App</h2>
            <p className="text-gray-500 max-w-md text-center">
              Select a conversation from the sidebar to start messaging, or search for new friends using the search icon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;