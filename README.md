# RAJ AI APP BUILDER

> Enterprise-grade AI-powered platform that converts natural language into production-ready React applications with real-time streaming.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Cerebras](https://img.shields.io/badge/Cerebras-AI-orange?style=flat-square)](https://cerebras.ai/)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+
- Cerebras API Key ([Get one here](https://cerebras.ai/))

### Installation

```bash
# Clone repository
git clone https://github.com/rajshah9305/NLPtoapp.git
cd NLPtoapp

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your Cerebras API key to .env

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 Features

- **Real-time AI Streaming** - Watch code generate token-by-token
- **Live Preview** - Instant React component rendering with Sandpack
- **Auto-Generated Tests** - Comprehensive test suites created automatically
- **v0.dev-Inspired UI** - Clean, modern, professional design
- **Production Ready** - Edge runtime, TypeScript, optimized performance

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router & Edge Runtime |
| TypeScript | Type-safe development |
| Cerebras AI | llama3.1-70b language model |
| Tailwind CSS | Utility-first styling |
| Sandpack | Live React preview |

## 📖 Usage

1. Enter a natural language description of your desired application
2. Click "Generate App" or press `⌘ + Enter`
3. Watch real-time code generation in the streaming panel
4. Switch between Code, Preview, and Tests tabs
5. Copy or download your generated component

### Example Prompts

```
Create a todo list with drag and drop, dark mode, and local storage
```

```
Build a weather dashboard with current conditions and 5-day forecast
```

```
Design a calculator with scientific functions and history
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/generate/route.ts    # Cerebras streaming API
│   ├── globals.css              # Tailwind styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main application
└── components/
    └── SandpackPreview.tsx      # Live preview component
```

## 🌐 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rajshah9305/NLPtoapp)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add `CEREBRAS_API_KEY` in Vercel Dashboard → Settings → Environment Variables

### Other Platforms

Compatible with any Next.js hosting:
- AWS Amplify
- Netlify
- Railway
- DigitalOcean

## 🔧 Development

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CEREBRAS_API_KEY` | Yes | Cerebras Cloud API key |

## 📝 API Reference

### POST /api/generate

Generates React component from natural language.

**Request:**
```json
{
  "prompt": "Create a todo list app"
}
```

**Response:** Server-Sent Events (SSE) stream

**Event Types:**
- `code` - Component code generation
- `test` - Test suite generation  
- `done` - Generation complete
- `error` - Error occurred

## 🎨 Design System

- **Colors**: White background, black text, orange (#F97316) accents
- **Typography**: Inter font family
- **Layout**: Responsive grid, rounded corners, generous whitespace
- **Animations**: 700ms smooth transitions

## 🔒 Security

- Server-side API key management
- Input validation and sanitization
- Edge runtime for optimal performance
- Rate limiting ready
- CORS protection

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 👨‍💻 Author

**Raj Shah**

- GitHub: [@rajshah9305](https://github.com/rajshah9305)
- Repository: [NLPtoapp](https://github.com/rajshah9305/NLPtoapp)

## 🙏 Acknowledgments

- [Cerebras](https://cerebras.ai/) - AI infrastructure
- [Vercel](https://vercel.com/) - Hosting platform
- [Sandpack](https://sandpack.codesandbox.io/) - Live preview

---

<div align="center">

**Built with ❤️ by [Raj Shah](https://github.com/rajshah9305)**

⭐ Star this repository if you find it helpful!

</div>
