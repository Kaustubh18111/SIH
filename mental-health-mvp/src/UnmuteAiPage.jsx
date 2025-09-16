import React from 'react';
import { FiMic } from 'react-icons/fi';

const UnmuteAiPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">Unmute AI</h1>

      <div className="bg-white rounded-lg shadow-md p-12 mt-8 flex flex-col items-center">
        <FiMic className="text-6xl text-indigo-500" />
        <p className="text-lg text-gray-600 mt-4">Click the button to start recording</p>

        <button
          type="button"
          className="mt-6 inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
        >
          <FiMic className="w-5 h-5 mr-2" />
          Start Session
        </button>

        <p className="text-sm text-gray-500 mt-4">Your session will be recorded for analysis.</p>
      </div>
    </div>
  );
};

export default UnmuteAiPage;
