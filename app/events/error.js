// app/events/error.js
"use client";

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen bg-gray-500 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-2xl font-bold text-[#ea176b] mb-4">Something went wrong!</h2>
        <p className="text-gray-700 mb-4">It&apos;s not your fault, try again later.</p> {/* Escaped ' */}
        <button
          onClick={() => reset()}
          className="bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] text-white px-4 py-2 rounded-md hover:from-[#c01059] hover:to-[#0a9a81]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}