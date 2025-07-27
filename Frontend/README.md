# AI Banking Assistant Frontend

A production-ready frontend for an AI Banking Assistant that demonstrates conversational AI capabilities for banking services. This application provides a clean, responsive interface for three core banking flows: card blocking, mini statements, and loan pre-eligibility checks.

![Banking Assistant](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3-blue)

## 🏦 Features

### Core Banking Flows
- **Card Blocking**: Secure card blocking with confirmation flow
- **Mini Statements**: Transaction history with account selection
- **Loan Eligibility**: Pre-qualification assessment with income/EMI analysis

### Chat Interface
- Real-time conversation with AI assistant
- Smart suggestion chips based on context
- Message history and conversation management
- Typing indicators and message status
- Copy messages and retry failed requests

### User Experience
- 📱 Responsive design for mobile and desktop
- 🌙 Dark/light theme support
- 💾 Conversation persistence in localStorage
- 🔗 Connection status monitoring
- ♿ Accessible keyboard navigation

### Developer Tools
- 🐛 Debug drawer for API inspection
- 📝 Request/response logging
- 🧠 Memory state visualization
- ⚙️ Environment configuration
- 🛡️ Error handling and recovery

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API server (see API section below)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-banking-assistant

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure your API URL in .env.local
echo "VITE_API_BASE_URL=http://localhost:3000" > .env.local

# Start development server
npm run dev
```

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview

# Start production server
npm run start
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3000

# For production, use your actual API domain:
# VITE_API_BASE_URL=https://your-api-domain.com
```

## 📡 API Integration

### Endpoint
The frontend communicates with a single backend endpoint:

```
POST /chat
```

### Request Format
```json
{
  "conversationId": "string (optional)",
  "text": "string (required)"
}
```

### Response Format
```json
{
  "conversationId": "string",
  "response": "string",
  "memory": { ... }
}
```

### Example Request/Response

**Request:**
```json
{
  "conversationId": "demo-1",
  "text": "Block my card ending 1234"
}
```

**Response:**
```json
{
  "conversationId": "demo-1",
  "response": "You're about to block the card ending ****1234. Proceed? (yes/no)",
  "memory": { "cardLast4": "1234" }
}
```

## 🏗️ Architecture

### Technology Stack
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality accessible components
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing
- **Lucide React** - Beautiful SVG icons

### Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── AppSidebar.tsx  # Conversation sidebar
│   ├── ChatHeader.tsx  # Header with controls
│   ├── MessageList.tsx # Chat messages
│   ├── Composer.tsx    # Message input
│   └── ...
├── lib/                # Utility libraries
│   ├── api.ts          # API client
│   ├── persist.ts      # localStorage helpers
│   └── ...
├── store/              # State management
│   └── chat.ts         # Zustand chat store
├── pages/              # Route components
│   ├── ChatLayout.tsx  # Main chat interface
│   ├── Flows.tsx       # Flow documentation
│   └── About.tsx       # Project information
└── hooks/              # Custom React hooks
```

## 💡 Usage

### Starting a Conversation
1. Open the application
2. Use Quick Actions for common tasks:
   - "Block Card" → Prefills card blocking request
   - "Mini Statement" → Prefills transaction request
   - "Loan Eligibility" → Prefills loan inquiry
3. Or type your request naturally

### Smart Suggestions
The interface automatically shows suggestion chips based on AI responses:
- `(yes/no)` → Shows [Yes] [No] [Cancel] chips
- `"Which account ID?"` → Shows example account IDs
- `"How many transactions?"` → Shows common limits

### Debug Mode
Click the debug icon (🐛) to open the debug drawer:
- **Memory Tab**: View current conversation memory
- **Raw Logs Tab**: Inspect API requests/responses

## 🧪 Testing Banking Flows

### 1. Block Card Flow
```
User: "Block my card ending 1234"
AI: "You're about to block the card ending ****1234. Proceed? (yes/no)"
User: [Click "Yes" chip or type "yes"]
AI: "Your card has been successfully blocked. Reference: #BLK123456"
```

### 2. Mini Statement Flow
```
User: "Show last 5 transactions for savings"
AI: "Which account ID would you like to check?"
User: [Click "SB-001" chip]
AI: [Displays transaction list]
```

### 3. Loan Eligibility Flow
```
User: "Loan pre eligibility"
AI: "What is your monthly income?"
User: [Click "₹75,000" chip]
AI: "What is your current total EMI?"
[Continues with eligibility assessment]
```

## 🎨 Customization

### Theming
The application uses a banking-focused design system with professional blue/gray colors. Customize in:
- `src/index.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind configuration

### Adding New Flows
1. Add prompt patterns to `SuggestedChips.tsx`
2. Update Quick Actions in `AppSidebar.tsx`
3. Document the flow in `Flows.tsx`

## 🔒 Security & Privacy

- No PII stored beyond conversation text in localStorage
- Client-side only conversation persistence
- Configurable data clearing with "Clear all data" option
- No analytics or external trackers

## 🚀 Deployment

The application can be deployed to any static hosting service:

### Vercel
```bash
npm run build
# Deploy 'dist' folder to Vercel
```

### Netlify
```bash
npm run build
# Deploy 'dist' folder to Netlify
```

### Traditional Web Server
```bash
npm run build
# Upload 'dist' folder contents to your web server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check `/flows` and `/about` pages in the app
- **Issues**: Report bugs and feature requests via GitHub Issues
- **API**: Ensure your backend implements the required `/chat` endpoint

---

**Note**: This is a proof-of-concept frontend. No real banking operations are performed. Always implement proper security measures for production banking applications.
