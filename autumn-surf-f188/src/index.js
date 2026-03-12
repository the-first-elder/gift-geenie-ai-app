import OpenAI from 'openai';
// import { env } from "cloudflare:workers";

const corsHeaders = {
	'Access-Control-Allow-Origin': '*', // Replace * with your allowed origin(s)
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Adjust allowed methods as needed
	'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Adjust allowed headers as needed
	'Access-Control-Max-Age': '86400', // Adjust max age (in seconds) as needed
};

const messages = [
	{
		role: 'system',
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

export default {
	async fetch(request, env, ctx) {
		// Handle preflight request
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					...corsHeaders,
				},
				status: 200, // Respond with OK status for preflight requests
			});
		}

		// Only process POST requests
		if (request.method !== 'POST') {
			return new Response(JSON.stringify({ error: `${request.method} method not allowed.` }), {
				status: 405,
				headers: {
					...corsHeaders,
				},
			});
		}

		try {
			const input = await request.json();
			messages.push({
				role: 'user',
				content: input.userPrompt,
			});
			console.log('input', input);
			const openai = new OpenAI({
				baseURL: env.OPENAI_BASE_URL,
				apiKey: env.OPENAI_API_KEY,
			});

			const response = await openai.responses.create({
				model: env.OPENAI_MODEL,
				input: messages,
			});

			const data = response.output_text;
			console.log('response', response);
			messages.pop();
			return new Response(JSON.stringify({ message: data }), {
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
				status: 200,
			});
		} catch (error) {
			console.log('error', error);
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}
	},
};
