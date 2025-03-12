// app/loading.js
export default function Loading() {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex flex-col items-center justify-center z-50">
        <div className="w-20 h-20 border-4 border-[#ea176b] border-t-[#e3ed18] rounded-full animate-spin"></div>
        <p className="mt-6 text-xl font-medium text-white">Loading...</p>
      </div>
    );
  }