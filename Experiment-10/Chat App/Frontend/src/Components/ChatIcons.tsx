import { Hash, Lock } from "lucide-react";

interface ChatIconsInfo {
  chatStatus: "public" | "private"; // 🔒 strict typing
  className?: string;
}

function ChatIcons({ chatStatus, className = "" }: ChatIconsInfo) {
  return (
    <div
      className={`flex items-center justify-center w-9 h-9 rounded-xl bg-gray-200 ${className}`}
    >
      {chatStatus === "public" ? (
        <Hash className="w-5 h-5 text-gray-700" />
      ) : (
        <Lock className="w-5 h-5 text-gray-700" />
      )}
    </div>
  );
}

export default ChatIcons;