import { useEffect, useState, useRef } from "react";
import { useRealtime } from "./RealtimeContext";

const colorPaletteFunctionDescription = `
Displays a color palette based on a given theme and list of colors.
`;

const weatherFunctionDescription = `
Gets the current weather for a given city.
`;

const customGPTFunctionDescription = `
Ask a user query to a CustomGPT project and get a response.
`;

console.log(1)
const sessionUpdate = {
  
  type: "session.update",
  session: {
    tools: [
      {
        type: "function",
        name: "display_color_palette",
        description: colorPaletteFunctionDescription,
        parameters: {
          type: "object",
          strict: true,
          properties: {
            theme: {
              type: "string",
              description: "Theme of the color palette (e.g. 'calm', 'energetic').",
            },
            colors: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of color values to include in the palette.",
            },
          },
          required: ["theme", "colors"],
        },
      },
      {
        type: "function",
        name: "get_weather",
        description: weatherFunctionDescription,
        parameters: {
          type: "object",
          strict: true,
          properties: {
            city: {
              type: "string",
              description: "The city to retrieve weather for.",
            },
          },
          required: ["city"],
        },
      },
      {
        type: "function",
        name: "ask_custom_gpt",
        description: customGPTFunctionDescription,
        parameters: {
          type: "object",
          strict: true,
          properties: {
            user_query: {
              type: "string",
              description: "The question or message the user wants to send to CustomGPT.",
            },
          },
          required: ["user_query"],
        },
      },
    ],
    tool_choice: "auto",
  },
};

function FunctionCallOutput({ functionCallOutput }) {
  console.log(1)
  const { name, arguments: rawArgs, gptResponse } = functionCallOutput;
  const args = JSON.parse(rawArgs || '{}');
  console.log(name)

  if (name === "display_color_palette") {
    const { theme, colors } = args;
    return (
      <div className="flex flex-col gap-2">
        <p>Theme: {theme}</p>
        {colors.map((color) => (
          <div
            key={color}
            className="w-full h-16 rounded-md flex items-center justify-center border border-gray-200"
            style={{ backgroundColor: color }}
          >
            <p className="text-sm font-bold text-black bg-slate-100 rounded-md p-2 border border-black">
              {color}
            </p>
          </div>
        ))}
        <pre className="text-xs bg-gray-100 rounded-md p-2 overflow-x-auto">
          {JSON.stringify(functionCallOutput, null, 2)}
        </pre>
      </div>
    );
  }

  if (name === "get_weather") {
    const { city, temperature, condition } = args;
    return (
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">Weather in {city}</h3>
        <p>Temperature: {temperature ?? "unknown"}</p>
        <p>Condition: {condition ?? "unknown"}</p>
        <pre className="text-xs bg-gray-100 rounded-md p-2 overflow-x-auto">
          {JSON.stringify(functionCallOutput, null, 2)}
        </pre>
      </div>
    );
  }

  if (name === "ask_custom_gpt") {
    const { user_query } = args;
    return (
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">CustomGPT Response</h3>
        <p><strong>Query:</strong> {user_query}</p>
        <p><strong>Response:</strong> {gptResponse ?? "Waiting for API..."}</p>
        <pre className="text-xs bg-gray-100 rounded-md p-2 overflow-x-auto">
          {JSON.stringify(functionCallOutput, null, 2)}
        </pre>
      </div>
    );
  }

  return <pre>{JSON.stringify(functionCallOutput, null, 2)}</pre>;
}

export default function ToolPanel() {
  const [functionAdded, setFunctionAdded] = useState(false);
  const [functionCallOutput, setFunctionCallOutput] = useState(null);
  const [apiStatus, setApiStatus] = useState("");
  const handledFunctionCalls = useRef({});

  const { sendClientEvent, isSessionActive, functionCalls } = useRealtime();

  useEffect(() => {
    functionCalls.forEach((functionCall) => {
      const callId = functionCall.response?.id;
      const output = functionCall.response?.output?.[0];

      if (!callId || handledFunctionCalls.current[callId] || !output) return;

      const { name } = output;

      if (["display_color_palette", "get_weather", "ask_custom_gpt"].includes(name)) {
        if (name === "ask_custom_gpt") {
          console.log(hi)
          const { user_query } = JSON.parse(output.arguments);
          setApiStatus(`Making API call for query: "${user_query}"`);
          console.log(`[CustomGPT API] Initiating request for query: "${user_query}"`);

          const myHeaders = new Headers();
          myHeaders.append("accept", "application/json");
          myHeaders.append("authorization", "Bearer 7414|jPGWYsa8itc7wQSLCOlkWDPup59NlKiI9q6ScuA02e0bd1e3");
          myHeaders.append("content-type", "application/json");

          const raw = JSON.stringify({
            response_source: "default",
            prompt: user_query,
          });

          const apiUrl = "https://app.customgpt.ai/api/v1/projects/74372/conversations/f365fb6c-93d5-4ee5-bbef-efa2b4a54d92/messages?stream=false&lang=en&";

          console.log(`[CustomGPT API] Sending request to: ${apiUrl}`);
          console.log(`[CustomGPT API] Request payload:`, raw);

          fetch(apiUrl, {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
          })
            .then((res) => {
              console.log(`[CustomGPT API] Received response with status: ${res.status}`);
              return res.json();
            })
            .then((apiRes) => {
              console.log(`[CustomGPT API] Full response:`, apiRes);
              setApiStatus(`API call successful for query: "${user_query}"`);
              
              const gptResponse = apiRes?.data?.openai_response ?? 
                                 apiRes?.message ?? 
                                 "No response from API.";
              const userQuery = apiRes?.data?.user_query ?? user_query;
              
              setFunctionCallOutput({ 
                ...output, 
                gptResponse,
                arguments: JSON.stringify({ 
                  ...JSON.parse(output.arguments),
                  user_query: userQuery
                })
              });
            })
            .catch((error) => {
              console.error(`[CustomGPT API] Error:`, error);
              setApiStatus(`API call failed for query: "${user_query}"`);
              setFunctionCallOutput({ 
                ...output, 
                gptResponse: "Error reaching CustomGPT API." 
              });
            });
        } else {
          setFunctionCallOutput(output);
        }

        setTimeout(() => {
          sendClientEvent({
            type: "response.create",
            response: {
              instructions: `Would you like anything else?`,
            },
          });
        }, 500);

        handledFunctionCalls.current[callId] = true;
      }
    });
  }, [functionCalls]);

  useEffect(() => {
    if (!isSessionActive) {
      setFunctionAdded(false);
    } else {
      setTimeout(() => {
        if (!functionAdded) {
          sendClientEvent(sessionUpdate);
          setFunctionAdded(true);
        }
      }, 500);
    }
  }, [isSessionActive]);

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="h-full bg-gray-50 rounded-md p-4">
        <h2 className="text-lg font-bold">Color Palette & Weather Tools</h2>
        {isSessionActive ? (
          functionCallOutput ? (
            <>
              <FunctionCallOutput functionCallOutput={functionCallOutput} />
              {apiStatus && (
                <div className="mt-2 p-2 bg-blue-50 text-blue-800 text-sm rounded">
                  API Status: {apiStatus}
                </div>
              )}
            </>
          ) : (
            <p>Ask for a color palette, weather update, or CustomGPT query...</p>
          )
        ) : (
          <p>Start the session to use these tools...</p>
        )}
      </div>
    </section>
  );
}