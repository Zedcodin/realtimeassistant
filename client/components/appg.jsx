import { useState } from "react";
import logo from "/assets/openai-logomark.svg";
import EventLog from "./EventLog";
import ChatLog from "./ChatLog";
import SessionControls from "./SessionControls";
import ToolPanel from "./ToolPanel";
import { RealtimeProvider } from "./RealtimeContext";

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <RealtimeProvider>
      <nav className="absolute top-0 left-0 right-0 h-16 flex items-center">
        <div className="flex items-center gap-4 w-full m-4 pb-2 border-0 border-b border-solid border-gray-200">
          <img style={{ width: "24px" }} src={logo} />
          <h1>realtime workshop</h1>
        </div>
      </nav>
      <main className="absolute top-16 left-0 right-0 bottom-0">
        <section className="absolute top-0 left-0 right-[380px] bottom-0 flex">
          <section className="absolute top-0 left-0 right-0 bottom-32 px-4 overflow-y-auto">
            <div className="tabs flex gap-2 mb-4 sticky top-0 z-10">
              <button
                onClick={() => setActiveTab("chat")}
                className={
                  activeTab === "chat"
                    ? "px-4 py-2 bg-blue-600 text-white"
                    : "px-4 py-2 bg-gray-200"
                }
              >
                Chat Log
              </button>
              <button
                onClick={() => setActiveTab("eventLog")}
                className={
                  activeTab === "eventLog"
                    ? "px-4 py-2 bg-blue-600 text-white"
                    : "px-4 py-2 bg-gray-200"
                }
              >
                Event Log
              </button>
            </div>
            {activeTab === "eventLog" ? <EventLog /> : <ChatLog />}
          </section>
          <section className="absolute h-32 left-0 right-0 bottom-0 p-4">
            <SessionControls />
          </section>
        </section>
        <section className="absolute top-0 w-[380px] right-0 bottom-0 p-4 pt-0 overflow-y-auto">
          {/* <ToolPanel /> */}
        </section>
      </main>
    </RealtimeProvider>
  );
}
