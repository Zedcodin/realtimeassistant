import { useState } from "react";
import {
  CloudLightning,
  CloudOff,
  MessageSquare,
  Mic,
  MicOff,
} from "react-feather";
import { useRealtime } from "./RealtimeContext";
import Button from "./Button";

function SessionStopped({ startSession }) {

  const [isActivating, setIsActivating] = useState(false);
  function handleStartSession() {
    if (isActivating) return;

    setIsActivating(true);
    startSession();
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Button
        onClick={handleStartSession}
        className={isActivating ? "bg-gray-600" : "bg-blue-600"}
        icon={<CloudLightning height={16} />}
      >
        {isActivating ? "starting conversion..." : "start conversion"}
      </Button>
    </div>
  );
}



function SessionActive({ stopSession, sendTextMessage, toggleMute }) {
  const [message, setMessage] = useState("");
  const [isMicActive, setIsMicActive] = useState(true);

  function handleSendClientEvent() {
    sendTextMessage(message);
    setMessage("");
  }

  function toggleMic() {
    toggleMute(!isMicActive);
    setIsMicActive(!isMicActive);
  }

  return (
    <div className="flex items-center justify-center w-full h-full gap-4">
      <input
        onKeyDown={(e) => {
          if (e.key === "Enter" && message.trim()) {
            handleSendClientEvent();
          }
        }}
        type="text"
        placeholder="send a text message..."
        className="border border-gray-200 rounded-full p-4 flex-1"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button
        onClick={() => {
          if (message.trim()) {
            handleSendClientEvent();
          }
        }}
        icon={<MessageSquare height={16} />}
        className="bg-blue-400"
      >
        send text
      </Button>
      <Button onClick={stopSession} icon={<CloudOff height={16} />}>
        disconnect
      </Button>
      <Button
        onClick={toggleMic}
        icon={isMicActive ? <Mic height={16} /> : <MicOff height={16} />}
      >
        {isMicActive ? "mute" : "unmute"}
      </Button>
    </div>
  );
}

export default function SessionControls() {
  const {
    isSessionActive,
    startSession,
    stopSession,
    sendClientEvent,
    sendTextMessage,
    toggleMute,
  } = useRealtime();

  return (
    <div className="flex gap-4 border-t-2 border-gray-200 h-full rounded-md">
      {isSessionActive ? (
        <SessionActive
          stopSession={stopSession}
          sendClientEvent={sendClientEvent}
          sendTextMessage={sendTextMessage}
          toggleMute={toggleMute}
        />
      ) : (
        <SessionStopped startSession={startSession} />
      )}
    </div>
  );
}
