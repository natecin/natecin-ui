# NATECIN - Lisk Sepolia Setup

Aplikasi ini dikonfigurasi untuk **Lisk Sepolia network only**.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
# atau
pnpm install
```

### 2. Run Development Server
```bash
npm run dev
# atau
pnpm dev
```

### 3. Connect Wallet & Auto-Switch
1. Buka http://localhost:3000
2. Klik **"Connect Wallet"**
3. ✨ **Aplikasi otomatis trigger switch ke Lisk Sepolia!**

## 🔧 Konfigurasi

### Network Configuration
Aplikasi sudah dikonfigurasi untuk **Lisk Sepolia only** di `lib/wagmi.ts`:

```typescript
export const liskSepolia = defineChain({
  id: 4202,
  name: 'Lisk Sepolia',
  rpcUrls: { default: { http: ['https://rpc.sepolia-api.lisk.com'] } },
  blockExplorers: { default: { url: 'https://sepolia-blockscout.lisk.com' } },
});
```

### Auto Network Switching
Component `NetworkSwitcher` akan otomatis:
- ✅ Detect jika wallet di network selain Lisk Sepolia
- ✅ Trigger MetaMask untuk switch network
- ✅ Tampilkan warning banner jika belum switch

## 📱 Add Lisk Sepolia ke MetaMask

Jika Lisk Sepolia belum ada di wallet Anda, tambahkan manual:

### Method 1: Manual
1. Buka MetaMask
2. Settings → Networks → Add Network
3. Isi:
   - **Network Name**: Lisk Sepolia
   - **RPC URL**: `https://rpc.sepolia-api.lisk.com`
   - **Chain ID**: `4202`
   - **Currency Symbol**: ETH
   - **Block Explorer**: `https://sepolia-blockscout.lisk.com`

### Method 2: Programmatic (Coming Soon)
Button "Add to MetaMask" akan otomatis menambahkan network.

## 🎯 Fitur yang Tersedia

### ✅ ETH Deposits
- Balance display real-time
- Deposit ETH ke vault
- USD conversion estimate

### ⚠️ Token Deposits (Not Available)
Token deposits **tidak tersedia** karena:
- Lisk Sepolia tidak di-support oleh major indexers (Alchemy, Moralis)
- BlockScout API bisa digunakan tapi belum di-implement

### 🔜 NFT Deposits (Coming Soon)
NFT deposit feature sedang dalam development.

## 🏗️ Architecture

```
lib/wagmi.ts
├─ Lisk Sepolia chain definition
└─ Wagmi config (Lisk only)

components/
├─ NetworkSwitcher.tsx
│  ├─ Auto-detect network
│  ├─ Trigger switch to Lisk Sepolia
│  └─ Warning banner
│
└─ vault/AssetDeposit.tsx
   ├─ ETH tab (working)
   └─ NFTs tab (coming soon)
```

## 🔍 How Auto-Switch Works

1. **User connects wallet** via MetaMask/injected provider

2. **NetworkSwitcher component detects chain**:
   ```typescript
   const chainId = useChainId();
   if (chainId !== 4202) {
     // Trigger switch
   }
   ```

3. **Auto-trigger switch using wagmi**:
   ```typescript
   switchChain({ chainId: liskSepolia.id })
   ```

4. **User approves** switch in MetaMask

5. **✅ Ready!** User now on Lisk Sepolia

## 📊 Testing

### Test Network Switch:
1. Connect wallet
2. Make sure you're on different network (e.g., Ethereum Mainnet)
3. Watch the app auto-trigger switch prompt
4. Approve in MetaMask
5. Verify you're on Lisk Sepolia (Chain ID: 4202)

### Test ETH Deposit:
1. Ensure you're on Lisk Sepolia
2. Get test ETH from faucet: https://sepolia-faucet.lisk.com/
3. Go to "Deposit Assets" → ETH tab
4. Enter amount and deposit

## 🐛 Troubleshooting

### "Wrong Network" banner tidak hilang
- Hard refresh browser: `Cmd+Shift+R` / `Ctrl+Shift+F5`
- Check MetaMask - pastikan benar-benar di Lisk Sepolia (Chain ID 4202)
- Check browser console untuk error

### Auto-switch tidak work
- Pastikan MetaMask installed
- Pastikan MetaMask sudah unlock
- Coba switch manual dulu via banner button

### Balance tidak muncul
- Pastikan wallet connected
- Pastikan ada ETH di Lisk Sepolia
- Get test ETH dari faucet

## 🔗 Useful Links

- **Lisk Sepolia RPC**: https://rpc.sepolia-api.lisk.com
- **Block Explorer**: https://sepolia-blockscout.lisk.com
- **Faucet**: https://sepolia-faucet.lisk.com/
- **Lisk Docs**: https://docs.lisk.com/

## 💡 Future Enhancements

### Planned Features:
- [ ] Token deposits via BlockScout API
- [ ] NFT deposits
- [ ] One-click "Add Network" button
- [ ] Custom token support (user input contract address)
- [ ] Multi-beneficiary setup
- [ ] Automated distribution logic

## 📝 Summary

| Feature | Status |
|---------|--------|
| Lisk Sepolia Support | ✅ Fully Configured |
| Auto Network Switch | ✅ Working |
| ETH Balance | ✅ Working |
| ETH Deposits | ✅ Working |
| Token Auto-Detection | ❌ Not Available |
| NFT Deposits | 🟡 Coming Soon |

---

**Fokus**: Lisk Sepolia only, simple & focused.
**No API keys needed**: Langsung pakai RPC.
**Auto-switch**: User experience yang smooth.
