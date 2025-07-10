import { useState } from "react";
import { RealtimeProvider } from "./RealtimeContext";
import SessionControls from "./SessionControls";
import Test from "./test";
import ToolPanel from "./ToolPanel";

export default function App() {


  
  return (
    <RealtimeProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Centered Brand Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Customgpt Realtime Assistant</h1>
          <p className="text-gray-500 max-w-md">
            Start a conversation with our AI assistant
          </p>
        </div>

        {/* Control Panel */}
        <div className="p-6 bg-white border-t border-gray-200">
          <div className="max-w-xs mx-auto">
            <SessionControls />
            <Test />
            <ToolPanel />
          </div>
        </div>
      </div>
    </RealtimeProvider>
  );
}