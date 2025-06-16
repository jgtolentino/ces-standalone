# Local Cursor - AI-Powered Code Editor

A fully local AI code editor powered by Devstral through Ollama. No cloud dependencies, complete privacy.

## Features

- 🎯 Monaco Editor with syntax highlighting
- 🤖 AI chat sidebar powered by Devstral
- 📁 Multi-tab file editing
- 🔄 Real-time streaming responses
- 🛡️ 100% local - no data leaves your machine
- ⚡ Fast inference with Devstral model

## Prerequisites

1. Install Ollama: https://ollama.ai
2. Pull Devstral model:
   ```bash
   ollama pull devstral
   ```

## Quick Start

```bash
# Clone the repository
git clone [your-repo]
cd local-cursor

# Install dependencies
npm install

# Start Ollama (in a separate terminal)
ollama serve

# Start the development server
npm run dev
```

Visit http://localhost:3000

## CLI Tool

Run the CLI for quick AI interactions:

```bash
npm run devstral
```

## Configuration

Edit `.env.local` to customize:

```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=devstral
```

## Deployment

### Vercel
```bash
vercel
```

### Docker
```bash
docker build -t local-cursor .
docker run -p 3000:3000 local-cursor
```

## Architecture

- **Frontend**: Next.js 14 with TypeScript
- **Editor**: Monaco Editor (VS Code's editor)
- **AI Backend**: Ollama with Devstral model
- **Styling**: Tailwind CSS

## License

MIT