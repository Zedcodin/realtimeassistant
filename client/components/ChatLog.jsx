import Markdown from "react-markdown";
import { useRealtime } from "./RealtimeContext";

function ChatMessage({ message }) {
  return (
    <div className="flex flex-col gap-2 p-2 rounded-md bg-gray-50">
      <div className="flex flex-col gap-2">
        <div className="text-sm text-blue-500 font-bold">{message.role}</div>
        <div className="markdown-body">
          <Markdown>{message.content}</Markdown>
        </div>
      </div>
    </div>
  );
}

export default function ChatLog() {
  const { events } = useRealtime();
  const eventsToDisplay = [];

  events.forEach((event) => {
    let message = null;
    if (
      event.type === "conversation.item.input_audio_transcription.completed" &&
      event?.transcript?.trim()
    ) {
      message = {
        role: "user",
        content: event.transcript,
      };
    } else if (
      event.type === "conversation.item.created" &&
      event?.item?.role === "user" &&
      event?.item?.content?.[0]?.text?.trim()
    ) {
      message = {
        role: "user",
        content: event.item.content[0].text,
      };
    } else if (
      event.type === "response.done" &&
      event?.response?.output?.[0]?.content?.[0]?.transcript?.trim()
    ) {
      message = {
        role: "assistant",
        content: event.response.output[0].content[0].transcript,
      };
    }

    if (message && message?.content?.trim() !== "") {
      eventsToDisplay.push(
        <ChatMessage key={event.event_id} message={message} />,
      );
    }
  });

  return (
    <div className="flex flex-col gap-2 overflow-x-auto">
      {eventsToDisplay.length === 0 ? (
        <div className="text-gray-500">Awaiting messages...</div>
      ) : (
        eventsToDisplay
      )}
    </div>
  );
}
