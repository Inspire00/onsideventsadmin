export default function Loading() {
    return (
      <div className="min-h-screen bg-gray-500 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] sm:px-6">
              <div className="h-8 w-48 bg-white bg-opacity-30 rounded animate-pulse"></div>
              <div className="mt-1 h-4 w-32 bg-white bg-opacity-20 rounded animate-pulse"></div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-16 h-16 border-4 border-[#ea176b] border-t-[#e3ed18] rounded-full animate-spin"></div>
                <div className="mt-4 h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }