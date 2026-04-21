import { Lock } from "lucide-react";
import { LockOpen } from "lucide-react";
interface GreenButtonProps
{
    typeOfChat: string;
    text: string;
}
function greenButton()
{
    return (
        <div className="w-15 h-5 bg-green-100 rounded-2xl border-2 border-green-300 flex items-center justify-center gap:0.5">
            <Lock className="w-3 h-4 text-green-400"></Lock>
            <p className="text-[10px] ml-1 text-green-400">Public </p>
        </div>
    );
}
export default greenButton;