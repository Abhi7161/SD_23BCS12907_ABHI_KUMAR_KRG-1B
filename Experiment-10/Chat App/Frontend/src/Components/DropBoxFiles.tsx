function DropBoxFiles() {
  return (
    <div className="absolute bottom-12 left-0 w-44 bg-white border border-gray-300 rounded-xl shadow-2xl p-2 z-50">
      <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
        📄 Document
      </div>

      <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
        🖼️ Photo
      </div>

      <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
        🎥 Video
      </div>

      <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
        🎵 Audio
      </div>
    </div>
  );
}

export default DropBoxFiles;