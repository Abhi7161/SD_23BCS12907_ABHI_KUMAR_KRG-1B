import { MessageSquare } from "lucide-react";
import ButtonComp from "./ButtonComp";
function Center() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      
      <div className="flex flex-col items-center gap-4 text-center">
        
        {/* Icon */}
        <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-2xl">
          <MessageSquare className="w-10 h-10 text-gray-700" />
        </div>

        {/* Heading */}
        <h2 className="text-lg font-semibold text-gray-800">
          Welcome to Chat Rooms
        </h2>

        {/* Subtext */}
        <p className="text-sm text-gray-500 max-w-xs">
          Select a room from the sidebar or join a new one to start chatting
        </p>

        {/* Button */}
       <ButtonComp text="Join a room"></ButtonComp>
      </div>
    </div>
  );
}

export default Center;