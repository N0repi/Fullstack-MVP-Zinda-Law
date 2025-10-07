# Q&A MVP

## Intro

I kept the code really simple, opting to use purely JavaScript for the MVP. I considered using Python for the backend, implementing a more complex RAG and a Vector DB, but felt it was beyond the scope.

## Setup

- Add an OpenAI API key to .env.example as the value for `OPENAI_API_KEY` | eg. `OPENAI_API_KEY='sk-proj...'`
- rename file from _.env.example_ to `.env`

- Open terminal and run

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

- Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Application Structure

**API Route**: `/src/pages/api/ask.js`

- Single endpoint handling retrieval, generation, and logging

**FAQ Data**: `/data/faqs.json`

- 6 legal FAQs with proper structure
- Categories and tags for better retrieval

**Logging Directory**: `/data/logs/`

- Stores interaction logs automatically

**Component File**: `/src/pages/Components/AskButton.jsx`

- Frontend for calling the API Route
- Passes states to Homepage

**Homepage**: `/src/pages/index.js`

- Minimalistic UI containing states for questions, answers, errors, and whether or not darkMode is toggled

**Prompt**: `/src/utils/prompt.js`

- Prompt used in API route
- Kept seperate from API route to make app structure modular.
