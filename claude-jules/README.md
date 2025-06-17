# Claude-Jules OS

The ultimate AI Operating System combining Claude Code's local AI capabilities with Jules-style intelligent workflows.

## 🌟 Features

- 🧠 **Smart Canvas**: Monaco editor with AI-powered task decomposition
- 💬 **Natural Commands**: Jules-style command interface (⌘K)
- 🚀 **Agent Workflows**: Automated code review, fixing, and generation
- 🎯 **Task Planning**: Intelligent task breakdown and execution
- 🔄 **Real-time Updates**: Live task status and code application
- 🛡️ **100% Local**: No cloud dependencies, complete privacy
- ⚡ **Multi-Agent**: Jules planner + Devstral coder + Operator executor

## 🚀 Quick Start

```bash
# Prerequisites
ollama serve &
ollama pull devstral

# Install and run
cd claude-jules
npm install
npm run dev
```

Open http://localhost:3000

## 🎮 Usage

### Web Interface
- Press **⌘K** to open command bar
- Use floating action panel for quick AI actions
- Monitor tasks in the right panel
- Edit code in Monaco editor with live AI assistance

### CLI Tool
```bash
npm run jules

# Example commands:
> fix this function for better performance
> analyze this repository structure
> generate a React component for user profiles
> summarize this codebase
```

## 🏗️ Architecture

```
claude-jules/
├── core/          # AI engines and task execution
├── ui/            # Next.js interface with components
├── agents/        # AI agents (Jules, Coder, Operator)
├── memory/        # Vector store and context cache
├── workflows/     # Predefined automation workflows
└── scripts/       # CLI tools and utilities
```

## 🤖 Agents

- **Jules**: Task planning and decomposition
- **Coder**: Code generation and modification using Devstral
- **Operator**: Shell operations and git management

## 🔧 Configuration

Edit `.env.local`:
```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=devstral
CLAUDE_JULES_MODE=local
```

## 📚 Workflows

Pre-built workflows in `workflows/`:
- Code review and optimization
- Repository analysis and documentation
- Automated app generation
- Bug detection and fixing

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Vercel Deployment
```bash
vercel
```

## 🔮 Roadmap

- [ ] Vector memory integration
- [ ] Custom workflow designer
- [ ] Multi-model support (Claude, GPT-4, etc.)
- [ ] Electron desktop app
- [ ] Plugin ecosystem
- [ ] Team collaboration features

## 🤝 Contributing

Claude-Jules OS is open source. Contributions welcome!

## 📄 License

MIT License - Build amazing AI experiences locally!