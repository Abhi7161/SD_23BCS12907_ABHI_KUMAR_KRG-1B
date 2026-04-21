import { Users } from "lucide-react";
import ChatIcons from "./ChatIcons";

interface DiscussionProps {
  chatStatus: "public" | "private";
  chatName: string;
  scount: string;
  notification: number;
  isSelected?: boolean;
  onClick?: () => void;
}

function Discussions({
  chatStatus,
  chatName,
  scount,
  notification,
  isSelected,
  onClick,
}: DiscussionProps) {
  return (
    <div className="flex flex-col gap-2" onClick={onClick}>
      <div className={`flex items-center justify-between p-3 hover:shadow-sm cursor-pointer transition rounded-xl ${isSelected ? 'bg-gray-200' : ''}`}>
        
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <ChatIcons chatStatus={chatStatus}></ChatIcons>
          <div>
            <h2 className="text-sm font-semibold">{chatName}</h2>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Users className="w-4 h-4" />
              <span>{scount}</span>
            </div>
          </div>
        </div>

        {/* Right Badge */}
        {notification > 0 && (
          <div className="bg-black text-white text-xs font-semibold px-2 py-1 rounded-full">
            {notification}
          </div>
        )}
      </div>
    </div>
  );
}

export default Discussions;