# NATECIN - Decentralized Inheritance Vault

> **"When your last breath fades... Your legacy begins."**

A high-fidelity, cyberpunk-themed decentralized inheritance vault application built with Next.js 14, Tailwind CSS, and Web3 integration.

## 🎨 Design Philosophy

NATECIN embodies a "High-end Fintech meets Cyberpunk Legacy" aesthetic with:
- **Deep void backgrounds** (Onyx Black #0C0C0F)
- **Soul Red accents** (#C11A29) for critical CTAs
- **Glassmorphism effects** for premium UI cards
- **Organic heartbeat animations** mimicking real EKG patterns
- **Space Grotesk** headings for futuristic solidity
- **Inter** body text for optimal readability

## ✨ Features

### Landing Page
- **Hero Section**: Centered headline with dual CTA buttons
- **Legacy Monitor**: Interactive overlay card featuring:
  - Live EKG-style heartbeat graph
  - Asset distribution donut chart
  - Real-time vault status indicators
  - Auto-execution timer with progress bar
- **Feature Cards**: Dual value proposition for vault owners and heirs

### Vault Creation Wizard
- **Step 1 - Configuration**:
  - Web3 wallet connection
  - Multi-heir management with dynamic percentage split
  - Real-time validation (must equal 100%)
  - Configurable inactivity timer (30 days, 6 months, 1 year, custom)

- **Step 2 - Asset Deposit**:
  - Multi-asset support (ETH, Tokens, NFTs)
  - Tabbed interface for asset types
  - Live USD conversion
  - "Max" button for quick balance selection

- **Step 3 - Review & Confirm**:
  - Comprehensive vault summary
  - Smart contract execution agreement

### Dashboard
- **Vault Grid**: Display all created vaults with:
  - Status indicators (Active, Warning, Executed)
  - Animated pulsing dots for active vaults
  - Total value locked per vault
  - Days remaining until auto-execution
  - Quick actions: "I'm Alive" button to reset timer

- **Statistics Cards**:
  - Total Value Locked across all vaults
  - Active vault count
  - Total beneficiaries

## 🛠 Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom theme
- **Icons**: Lucide React
- **Animations**: Framer Motion + Custom CSS animations
- **Charts**: Recharts for data visualization
- **Web3**: wagmi + viem (ready for integration)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
natecin/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/
│   │   └── page.tsx          # Vault dashboard
│   ├── layout.tsx            # Root layout with fonts
│   └── globals.css           # Global styles & theme
├── components/
│   ├── landing/
│   │   ├── Hero.tsx          # Hero section
│   │   ├── LegacyMonitor.tsx # Overlay card with graphs
│   │   └── FeatureCards.tsx  # Value proposition cards
│   ├── vault/
│   │   ├── VaultWizard.tsx   # Multi-step modal
│   │   ├── HeirManager.tsx   # Heir configuration UI
│   │   └── AssetDeposit.tsx  # Asset tabs interface
│   └── ui/
│       ├── Button.tsx        # Reusable button
│       ├── Card.tsx          # Glassmorphic card
│       ├── HeartbeatGraph.tsx # EKG animation
│       └── DonutChart.tsx    # Asset distribution chart
└── lib/
    └── utils.ts              # Utility functions
```

## 🎨 Design System

### Color Palette
- **Onyx Black**: `#0C0C0F` - Primary background
- **Dark Charcoal**: `#1A1A1F` - Surface/Cards
- **Soul Red**: `#C11A29` - Primary accent & CTAs
- **Pulse Red**: `#FF2E3B` - Heartbeat & alerts
- **Silver Dust**: `#CFCFCF` - Body text
- **Ghost White**: `#F8F9FA` - Headings

### Typography
- **Headings**: Space Grotesk (Bold/SemiBold)
- **Body**: Inter (Regular/Medium)

### Component Styles
- **Border Radius**: 8px (Strict)
- **Glassmorphism**: `backdrop-blur-xl` + `bg-white/5`
- **Animations**: Organic heartbeat with lub-dub rhythm

## 🔐 Security Note

This is a frontend implementation. For production use:
- Implement proper smart contract integration
- Add wallet authentication with wagmi/viem
- Integrate with actual blockchain networks
- Add comprehensive error handling
- Implement rate limiting and security measures

## 📝 Next Steps

1. **Smart Contract Integration**: Connect to Ethereum/Polygon networks
2. **Wallet Authentication**: Implement Web3 wallet connection
3. **Backend API**: Create server endpoints for vault management
4. **Testing**: Add unit and integration tests
5. **Mobile Optimization**: Fine-tune responsive design
6. **Accessibility**: Implement WCAG compliance

## 📄 License

ISC

---

**Built with precision for a decentralized future.**
