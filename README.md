# Lore Frontend

Next.js frontend for decentralized IP asset management platform with AI-powered content generation.

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local` file in `lore-frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-reown-project-id
```

### 3. Run Development Server

```bash
npm run dev
```

Application runs at `http://localhost:3000`

## Getting Started

1. **Backend Setup:** Ensure backend is running at `http://localhost:8000`
2. **Connect Wallet:** Click "Connect Wallet" and select wallet provider
3. **Sign Message:** Authenticate with your wallet signature
4. **Create Assets:** Click "Mint IP Asset" to register new IP on Story Protocol
5. **Browse Assets:** Visit "Explore" to see all assets
6. **Create Derivatives:** Click "Create Remix" on any asset that allows derivatives

## Pages

- **Home (`/`)** - Landing page with features
- **Explore (`/explore`)** - Browse all IP assets
- **Asset Detail (`/explore/[id]`)** - View asset details, create remixes, claim royalties
- **Dashboard (`/dashboard`)** - Your assets and earnings (requires authentication)

## Key Features

### Core Features
- **Wallet Connection** - Reown AppKit (WalletConnect v2)
- **SIWE Authentication** - Sign-In with Ethereum
- **IP Asset Creation** - Upload media, set license terms, register on Story Protocol
- **Derivative Creation** - Create remixes with automatic royalty tracking
- **Royalty Management** - Check balance and claim earnings

### AI-Powered Features ✨
- **AI Title Generation** - Get 4 creative title suggestions from your description
- **AI Description Enhancement** - Expand brief descriptions into detailed 150-200 word narratives
- **AI License Suggestions** - Get optimal royalty percentage and rights recommendations
- **Real-time AI Processing** - Loading states and instant feedback
- **Smart Caching** - Fast responses with Redis-backed caching

## Project Structure

```
lore-frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── explore/           # Browse assets
│   ├── dashboard/         # User dashboard
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── layout/           # Header, Footer
│   ├── mint/             # MintModal (with AI features), RemixModal
│   ├── ui/               # Button, Card components
│   └── dashboard/        # Dashboard components
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts        # Wallet authentication
│   ├── useAssets.ts      # Asset CRUD operations
│   └── useAI.ts          # AI features (NEW)
├── lib/                   # Utilities
│   ├── api.ts            # API client (includes aiAPI)
│   └── types.ts          # TypeScript types (includes AI types)
└── package.json
```

## Using AI Features

The Mint Modal includes three AI-powered buttons:

### 1. AI Title Generation (Amber Button)
1. Enter a brief description in the description field
2. Click "AI Generate" button next to the title field
3. Wait 2-4 seconds for 4 title suggestions
4. Click any suggestion to use it as your title

### 2. AI Description Enhancement (Purple Button)
1. Enter a brief description (e.g., "A mystical forest at sunset")
2. Click "AI Enhance" button next to the description field
3. Wait 3-5 seconds for enhanced 150-200 word description
4. Description field auto-updates with enhanced text

### 3. AI License Suggestion (Green Button)
1. Make sure description is filled
2. Scroll to "License Terms" section
3. Click "AI Suggest" button
4. Wait 2-3 seconds
5. License terms auto-fill with optimal:
   - Royalty percentage
   - Allow derivatives checkbox
   - Commercial rights checkbox

**Note:** Backend must have `OPENROUTER_API_KEY` configured for AI features to work.

## Getting API Keys

**Reown (WalletConnect) Project ID:**
1. Visit https://cloud.reown.com
2. Create new project
3. Copy Project ID
4. Add to `.env.local` as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

## Common Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npm run type-check
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion 12
- **State Management:** React Query (TanStack Query) 5
- **Wallet:** Reown AppKit (WalletConnect v2)
- **Web3:** Wagmi 3 & Viem 2
- **HTTP Client:** Axios 1.13
- **Icons:** Lucide React

## Wallet Setup

**MetaMask Configuration:**
1. Open MetaMask
2. Add Network:
   - Network Name: Story Aeneid Testnet
   - RPC URL: https://aeneid.storyrpc.io
   - Chain ID: 1315
   - Currency Symbol: ETH
3. Get testnet tokens from Story Protocol faucet

## Troubleshooting

**Development server won't start:**
- Delete `node_modules` and `.next`
- Run `npm install` again
- Check `.env.local` exists

**Wallet won't connect:**
- Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- Clear browser cache and localStorage
- Try different browser

**API requests fail:**
- Ensure backend is running at `http://localhost:8000`
- Check CORS configuration in backend
- Verify you're authenticated (connected wallet + signed message)

**Wrong network error:**
- Switch MetaMask to Story Aeneid Testnet (Chain ID: 1315)
- Or add network using configuration above

**AI buttons disabled:**
- AI Title Generate requires description to be filled first
- AI Description Enhance requires description to be filled
- AI License Suggest requires description to be filled

**AI requests fail:**
- Check backend server is running
- Verify backend has `OPENROUTER_API_KEY` in `.env`
- Open browser DevTools → Network tab to see error details
- Check backend logs for AI service errors

**AI requests take too long:**
- Free OpenRouter models can be slow (5-10 seconds is normal)
- Check internet connection
- Model may be rate limited (will auto-fallback to next model)

## Environment Variables

**Required:**
- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., http://localhost:8000)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Reown project ID

**Note:** All client-side environment variables must be prefixed with `NEXT_PUBLIC_`
