import { useEffect, useState, useRef } from "react";
import { useRealtime } from "./RealtimeContext";

const colorPaletteFunctionDescription = `
Displays a color palette based on a given theme and list of colors.
`;

const customGPTFunctionDescription = `
Ask a user query to a CustomGPT project and get a response.
`;

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

// const FunctionCallOutput = async ({ functionCallOutput }) => {
//   const  arguments_data = JSON.parse(functionCallOutput?.arguments);
//   //console.log(functionCallOutput )

//   if(functionCallOutput?.name === "ask_custom_gpt"){
//     const user_query = arguments_data.user_query
//     const response = await getOpenAIResponse(user_query)
//     console.log(response)
//   }


  

//   // const colorBoxes = colors.map((color) => (
//   //   <div
//   //     key={color}
//   //     className="w-full h-16 rounded-md flex items-center justify-center border border-gray-200"
//   //     style={{ backgroundColor: color }}
//   //   >
//   //     <p className="text-sm font-bold text-black bg-slate-100 rounded-md p-2 border border-black">
//   //       {color}
//   //     </p>
//   //   </div>
//   // ));

//   // return (
//   //   <div className="flex flex-col gap-2">
//   //     <p>Theme: {theme}</p>
//   //     {colorBoxes}
//   //     <pre className="text-xs bg-gray-100 rounded-md p-2 overflow-x-auto">
//   //       {JSON.stringify(functionCallOutput, null, 2)}
//   //     </pre>
//   //   </div>
//   // );
// }

export const FunctionCallOutput = ({ functionCallOutput,sendToolResponse }) => {
  const [response, setResponse] = useState(null);

  useEffect(() => {
    const fetchResponse = async () => {
      if (functionCallOutput?.name === "ask_custom_gpt") {
        try {
          const argsString = functionCallOutput.arguments;
          const arguments_data = JSON.parse(argsString);
          const user_query = arguments_data.user_query;

          const res = await getOpenAIResponse(user_query);
          sendToolResponse(res,user_query)
          setResponse(res);
        } catch (error) {
          console.error("Error processing functionCallOutput:", error);
        }
      }
    };

    fetchResponse();
  }, [functionCallOutput]);

  return (
    <div>
      {/* <h3>Custom GPT Response:</h3>
      {response ? <p>{response}</p> : <p>Loading...</p>} */}
    </div>
  );
};



export async function getOpenAIResponse(prompt) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  myHeaders.append("authorization", "Bearer 7414|jPGWYsa8itc7wQSLCOlkWDPup59NlKiI9q6ScuA02e0bd1e3");
  myHeaders.append("content-type", "application/json");

  const body = JSON.stringify({
    response_source: "default",
    prompt: prompt,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: body,
    redirect: "follow",
  };

  try {
    const res = await fetch(
      "https://app.customgpt.ai/api/v1/projects/74372/conversations/f365fb6c-93d5-4ee5-bbef-efa2b4a54d92/messages?stream=false&lang=en&",
      requestOptions
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }

    const data = await res.json();
    return data?.data?.openai_response || null;

  } catch (error) {
    console.error("Error fetching OpenAI response:", error.message);
    return null;
  }
}


export default function ToolPanel() {
  const [functionAdded, setFunctionAdded] = useState(false);
  const [functionCallOutput, setFunctionCallOutput] = useState(null);
  const handledFunctionCalls = useRef({});

  const { sendClientEvent, isSessionActive, functionCalls,events, sendToolResponse } = useRealtime();

  useEffect(() => {
    functionCalls.forEach((functionCall) => {
      console.log(functionCall)
      if (handledFunctionCalls.current[functionCall.response.id]) return;

      if (
        functionCall?.response?.output?.[0]?.name === "display_color_palette"
      ) {
        console.log(9)
        setFunctionCallOutput(functionCall.response.output[0]);
        setTimeout(() => {
          sendClientEvent({
            type: "response.create",
            response: {
              instructions: `
              ask for feedback about the color palette - don't repeat 
              the colors, just ask if they like the colors.
            `,
            },
          });
        }, 500);
        handledFunctionCalls.current[functionCall.response.id] = true;
      }else if(
        functionCall?.response?.output?.[0]?.name === "ask_custom_gpt"
      ) {
         console.log(9)
        setFunctionCallOutput(functionCall.response.output[0]);
        setTimeout(() => {
          sendClientEvent({
            type: "response.create",
            response: {
              instructions: `
             Tell the user let me fetch for you the information you have requested.would you like me to do something else while we wait for the reponse
            `,
            },
          });
        }, 500);
        handledFunctionCalls.current[functionCall.response.id] = true;
        
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
  }, [events]);

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="h-full bg-gray-50 rounded-md p-4">
        <h2 className="text-lg font-bold"></h2>
        {isSessionActive ? (
          functionCallOutput ? (
            <FunctionCallOutput functionCallOutput={functionCallOutput} sendToolResponse= {sendToolResponse} />
          ) : (
            <p>Ask for advice on CustomGPT</p>
          )
        ) : (
          <p>Start the session to use this tool...</p>
        )}
      </div>
    </section>
  );
}