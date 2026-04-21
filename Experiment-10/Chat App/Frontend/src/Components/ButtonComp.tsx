interface ButtonProps {
  text: string;
  onClick?: () => void;
  className?: string; // 👈 allow overrides
}

function ButtonComp({ text, onClick, className = "" }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition ${className}`}
    >
      {text}
    </button>
  );
}

export default ButtonComp;