## Gift Genie 🎁

AI‑powered gift recommendation assistant with a small web UI, a local Express server, and a Cloudflare Worker backend option.

### Overview

- **Purpose**: Help users quickly discover thoughtful, realistic gift ideas tailored to context (location, urgency, constraints).
- **Frontend**: Vite‑powered single‑page app (`index.html`, `index.js`, `style.css`, `utils.js`).
- **Backend (option 1)**: Local Express server (`server.js`) that forwards requests to an AI provider via the OpenAI Responses API.
- **Backend (option 2)**: Cloudflare Worker (`autumn-surf-f188/`) that exposes an HTTP endpoint used by the frontend.
- **AI provider**: Configurable via environment variables (e.g. OpenRouter / OpenAI compatible APIs).

The assistant responds in structured Markdown with headings for each gift, a short explanation, a **How to get it** section, web search links, and follow‑up questions.

### Project Structure

- **Root**
  - `index.html` – main HTML page served by Vite.
  - `index.js` – browser entry script; wires up the form and calls the backend.
  - `style.css` – styling for the UI.
  - `utils.js` – UI helpers (auto‑resize textarea, loading state, streaming helpers).
  - `server.js` – Express server exposing `POST /api/gift` and calling the AI provider.
  - `responses.js` – small Node script demonstrating a direct Responses API call.
  - `serverutils.js` – environment validation for the server (e.g. required vars).
  - `schema.js`, `websearch.js` – additional helpers for AI / web search (optional).
  - `vite.config.js` – Vite configuration for the frontend.
- **`autumn-surf-f188/`**
  - Cloudflare Worker project with:
    - `src/index.js` – Worker logic that calls the AI Responses API.
    - `public/index.html` – static asset example.
    - Wrangler configuration files for deployment.

### Prerequisites

- **Node.js**: v18+ (v20+ recommended).
- **npm**: v9+.
- An **AI provider API key** compatible with the OpenAI SDK (e.g. OpenRouter / OpenAI‑compatible gateway).
- (Optional) **Cloudflare account** and Wrangler CLI if you want to deploy the Worker backend.

### Installation

```bash
git clone <this-repo-url>
cd gift_gennie
npm install
```

### Environment Variables

Create a `.env` file in the project root (do **not** commit your real keys) with values like:

```bash
AI_URL="https://openrouter.ai/api/v1"      # or another OpenAI-compatible base URL
AI_KEY="sk-..."                            # your API key
AI_MODEL="openai/gpt-5-nano"               # model identifier supported by your provider
```

- **`AI_URL`**: Base URL for the AI provider.
- **`AI_KEY`**: Secret API key; used by Node scripts and the Express server.
- **`AI_MODEL`**: Model name/string used by the Responses API.

The Cloudflare Worker reads its configuration from environment bindings (see the Worker section below) rather than `.env` directly.

### Running the Frontend (Vite)

From the project root:

```bash
npm run dev
```

Vite will start a dev server, typically on `http://localhost:5173/`. If that port is taken, it may use `http://localhost:5174/` (CORS in `server.js` is configured for `5174`).

Open the displayed URL in your browser to use Gift Genie.

### Backend Options

You have two ways to talk to the AI provider: local Express or Cloudflare Worker.

#### Option 1: Local Express Server (`server.js`)

The Express server:

- Validates environment via `checkEnvironment` (`serverutils.js`).
- Instantiates an `OpenAI` client with `AI_URL` and `AI_KEY`.
- Exposes `POST /api/gift`:
  - Accepts `{ userPrompt }` in the JSON body.
  - Adds the prompt to a conversation (`messages` array).
  - Calls `openai.responses.create` with `AI_MODEL`.
  - Returns `{ message: response.output_text }` or a friendly error message.

To run it:

```bash
node server.js
```

Then update the frontend to use the local server (if it is not already):

- In `index.js`, point `createPrompt` to `http://localhost:3001/api/gift`:
  - Ensure the `fetch` to the Cloudflare Worker is commented out.
  - Uncomment / use the fetch that targets the local `/api/gift` endpoint.

Make sure the CORS origin in `server.js` matches your Vite dev URL (by default `http://localhost:5174`).

#### Option 2: Cloudflare Worker (`autumn-surf-f188/`)

The Worker:

- Handles CORS and JSON POST requests.
- Maintains a `messages` array with system + user messages.
- Uses `OpenAI` (Responses API) with environment bindings:
  - `OPENAI_BASE_URL`
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL`
- Returns `{ message: <markdown-string> }` to the frontend.

To configure and deploy (high‑level):

1. Install Wrangler if you haven’t already:

   ```bash
   npm install -g wrangler
   ```

2. Log in:

   ```bash
   npx wrangler login
   ```

3. In the `autumn-surf-f188` directory, set your environment bindings (e.g. via `wrangler.toml` or dashboard) for:
   - `OPENAI_BASE_URL`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`

4. Deploy the Worker:

   ```bash
   cd autumn-surf-f188
   npx wrangler deploy
   ```

5. Update the frontend `createPrompt` function in the root `index.js` to call your Worker URL (e.g. `https://<your-worker>.workers.dev/m`) if it is not already.

### How the Frontend Works

At a high level:

- User types a description of the recipient / situation into a textarea and submits the form.
- `index.js`:
  - Prevents default form submission.
  - Validates the input.
  - Shows a loading state via `setLoading(true)`.
  - Sends `{ userPrompt }` to the configured backend (Express or Worker).
  - Receives a Markdown string in `data.message`.
  - Renders it as HTML inside `#output-content` using `marked` + `DOMPurify`.
- On error, a user‑friendly message is displayed instead of the AI output.

### Development Tips

- **Do not expose secrets**: never commit `.env` or real API keys.
- **CORS issues**:
  - Confirm the origin in `server.js` matches your dev URL.
  - If using the Worker, ensure CORS headers allow your frontend origin.
- **Model errors**:
  - Ensure `AI_MODEL` (or `OPENAI_MODEL`) matches a model supported by your provider.
  - Check the provider’s dashboard/logs if calls fail with 4xx/5xx errors.

### Scripts

From `package.json`:

- **`npm run dev`**: Start Vite dev server.
- **`npm run build`**: Build the frontend for production.
- **`npm run preview`**: Preview the built frontend.

You can also run:

- **`node responses.js`**: Quick CLI‑style test of the Responses API (uses `.env`).
- **`node server.js`**: Start the Express API server on `http://localhost:3001/`.

### License

This project is for learning and experimentation.
