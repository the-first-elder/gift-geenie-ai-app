import { autoResizeTextarea, setLoading, showStream } from "./utils.js";
import { marked } from "marked";
import DomPurify from "dompurify";

// Get UI elements
const giftForm = document.getElementById("gift-form");
const userInput = document.getElementById("user-input");
const outputContent = document.getElementById("output-content");
const url = "http://localhost:3001";
function start() {
  // Setup UI event listeners
  userInput.addEventListener("input", () => autoResizeTextarea(userInput));
  giftForm.addEventListener("submit", handleGiftRequest);
}

async function handleGiftRequest(e) {
  // Prevent default form submission
  e.preventDefault();

  // Get user input, trim whitespace, exit if empty
  const userPrompt = userInput.value.trim();
  if (!userPrompt) return;
  console.log("userPrompt:--------------------------------");
  console.log(userPrompt);
  console.log("--------------------------------");

  // messages.push({
  //   role: "user",
  //   content: `Generate fresh gift ideas for this new user request: ${userPrompt}`,
  // });
  /**
   * Challenge: Adding AI to the Gift Genie UI
   *
   * The UI is wired up.
   * The loading state is ready.
   * But no AI request happens yet.
   *
   * Your task:
   *
   * 1. Add a user message to the messages array
   * 2. Send a chat completions request
   * 3. Extract the assistant’s response
   * 4. Render it inside #output-content
   *
   * 💡 Check the hints folder for more guidance!
   */

  // Set loading state
  setLoading(true);
  try {
    const response = await createPrompt(userPrompt);
    // const response = await openai.chat.completions.create({
    //   model: process.env.AI_MODEL,
    //   messages: messages,
    //   stream: true,
    //   //   temperature: 1.2
    //   // top_p:0.5
    // });

    // const response = await openai.responses.create({
    //   model: process.env.AI_MODEL,
    //   input: messages,
    //   tools: [
    //     {
    //       type: "web_search_preview",
    //     },
    //   ],
    // });
    // / Show output container immediately for streaming feedback
    showStream();

    console.log("response", response);

    // const gift_suggestions = response.output_text;
    outputContent.innerHTML = DomPurify.sanitize(marked.parse(response));
    // let fullContent = "";
    // for await (const chunk of response) {
    //   //   console.log(chunk);
    //   const content = chunk.choices?.[0]?.delta?.content;

    //   if (!content) continue;
    //   fullContent += content;

    //   outputContent.innerHTML = DomPurify.sanitize(marked.parse(fullContent));
    //   //   sleep(5000);
    // }
    // const content = response.choices[0].message.content;
    // console.log(response.choices[0].message.content);
    // // Clear loading state
    // document.getElementById("output-content").innerHTML = DomPurify.sanitize(
    //   marked.parse(content),
    // );
  } catch (error) {
    console.log(error);
    outputContent.innerHTML =
      "Sorry i cant access what i need right now please try again later";
  } finally {
    setLoading(false);
  }
}
// for await (const chunk of stream) {
//     console.log(chunk.choices[0].delta.content);
//   }
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
start();

async function createPrompt(message) {
  // const response = await fetch(`${url}/api/gift`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({ userPrompt: message }),
  // });
  // testing fetch from worker
  const response = await fetch(
    "https://autumn-surf-f188.autumn-test.workers.dev/m",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userPrompt: message }),
    },
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error("Server error");
  }
  console.log("data", response);
  return data.message;
}

// const systemPrompt =
//   "you are a helpful assistant that suggests gifts for someone, you should respond in less than 100 words and be very firendly, give locations as to where they ca purchase gifts online and the price range";

// const prompt =
//   "suggest some gifts for someone who loves staying at home so much";
// const messages = [
//   {
//     role: "system",
//     content: systemPrompt,
//   },
//   {
//     role: "user",
//     content: prompt,
//   },
// ];
// console.log("making request to the AI...");

// try {
//   const response = await openai.chat.completions.create({
//     model: process.env.AI_MODEL,
//     messages: messages,
//     max_completion_tokens: 200,
//   });
//   //   console.log(response);
//   //   console.log("response from the AI:--------------------------------");
//   //   console.log(response.choices[0].message.content);
//   //   messages.push({
//   //     role: "assistant",
//   //     content: response.choices[0].message.content,
//   //   });

//   //   console.log("--------------------------------");
//   //   console.log(mes sages);
//   console.log("--------------------------------");
//   console.log(response.choices[0].message.content);
// } catch (error) {
//   if (error.status === 401 || error.status === 403) {
//     console.error(
//       "Authentication error: Check your AI_KEY and make sure it’s valid.",
//     );
//   } else if (error.status >= 500) {
//     console.error(
//       "AI provider error: Something went wrong on the provider side. Try again shortly.",
//     );
//   } else {
//     console.error("Unexpected error:", error.message || error);
//   }
// }

// // messages.push({
// //   role: "user",
// //   content: "give me more suggestions",
// // });

// // const response3 = await openai.chat.completions.create({
// //   model: process.env.AI_MODEL,
// //   messages: messages,
// //   max_completion_tokens: 200,
// // });
// // console.log(response3);
// // console.log("response3 from the AI:--------------------------------");
// // console.log(response3.choices[0].message.content);

// // main();
