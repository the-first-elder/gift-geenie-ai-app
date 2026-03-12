import express from "express";
import { checkEnvironment } from "./serverutils.js";
import OpenAI from "openai";
import cors from "cors";
checkEnvironment();

const openai = new OpenAI({
  baseURL: process.env.AI_URL,
  apiKey: process.env.AI_KEY,
  //   dangerouslyAllowBrowser: true,
});

const messages = [
  {
    role: "system",
    content: `You are Gift Genie, an intelligent gift recommendation assistant that can search the web.
    
    Your goal is to suggest thoughtful, practical, and context-aware gifts.
    
    Rules:
    - Always prioritize gifts that are realistic to obtain in the user's current location.
    - Use contextual clues such as location, airport, city, weather, time of day, and urgency.
    - If the user is in an airport or traveling, prioritize lightweight, portable gifts.
    - If the request is "last minute", suggest items commonly available in airports, malls, or convenience stores.
    - Avoid unrealistic or hard-to-find gifts.
    - Include the current price or a price range
    - Provide websearch links as well so users can click link and buy 
    -If the user mentions a location, situation, or constraint,
      adapt the gift ideas and add another short section 
      under each gift that guides the user to get the gift in that 
      constrained context.
    
    Response format rules:
    - Use clean structured Markdown.
    - Each gift must have a heading (### Gift Name).
    - Provide a short explanation (1–2 sentences).
    - Include a **How to get it** section with practical steps.
    -Include link to an image of where to get it
    Example format:
    
    ### Gift Name
    
    Short explanation of why this gift is suitable.
    
    **How to get it**
    1. Step one
    2. Step two
    3. Step three
  
    
    Response limits:
    - Maximum 4 gift suggestions.
    - Keep the total response under 120 words.
    - Be concise and practical.
    
    Finish the response with:
    
    ## Questions for you
    
    Ask 2–3 follow-up questions that help refine the recommendations (budget, age, preferences, etc).
    questions should be numbered
    Never include introductions like "Here are some ideas".
    Never include conclusions.
    Only output the structured response.`,
  },
];

const app = express();
app.use(express.json());
// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5174",
  }),
);

app.post("/api/gift", async (req, res) => {
  const { userPrompt } = req.body;
  console.log(userPrompt);
  messages.push({
    role: "user",
    content: userPrompt,
  });
  try {
    const response = await openai.responses.create({
      model: process.env.AI_MODEL,
      input: messages,
    });
    messages.pop();
    res.json({ message: response.output_text });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: `It's not you, it's us. 
            Something went wrong on the server`,
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
