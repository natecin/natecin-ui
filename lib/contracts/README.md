# NATECIN Smart Contract Integration

This directory contains the complete integration setup for NATECIN smart contracts using wagmi and viem.

## 📁 Structure

```
/lib/contracts/
├── index.ts          # Contract configuration and types
├── types.ts          # TypeScript type definitions
├── utils.ts          # Utility functions and helpers
└── README.md         # This file

/hooks/
└── useVaults.ts      # React hooks for contract interactions

/components/vault/
├── CreateVaultForm.tsx  # Vault creation form
├── VaultCard.tsx        # Vault display card
├── VaultManager.tsx      # Main vault management component
└── index.ts             # Component exports
```

## 🚀 Quick Start

### 1. Update Contract Addresses

Edit `/lib/contracts/index.ts` and update the contract addresses:

```typescript
export const CONTRACT_ADDRESSES = {
  factory: "0xYOUR_FACTORY_ADDRESS_HERE",
  registry: "0xYOUR_REGISTRY_ADDRESS_HERE",
} as const;
```

### 2. Use the VaultManager Component

```tsx
import { VaultManager } from '@/components/vault';

export default function VaultsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Vaults</h1>
      <VaultManager />
    </div>
  );
}
```

### 3. Individual Component Usage

```tsx
import { CreateVaultForm, VaultCard } from '@/components/vault';
import { useVaultsByOwner } from '@/hooks/useVaults';

function MyApp() {
  const { vaults } = useVaultsByOwner(userAddress);
  
  return (
    <div>
      <CreateVaultForm 
        onSuccess={(msg) => console.log(msg)}
        onError={(err) => console.error(err)}
      />
      
      {vaults.map(vault => (
        <VaultCard 
          key={vault} 
          vaultAddress={vault}
          onDeposit={(addr) => console.log('Deposit to', addr)}
        />
      ))}
    </div>
  );
}
```

## 📚 Available Hooks

### `useVaultsByOwner(ownerAddress)`
Get all vaults owned by a specific address.

### `useVaultDetails(vaultAddress)`
Get vault details from the factory contract.

### `useVaultSummary(vaultAddress)`
Get comprehensive vault summary from the vault contract.

### `useCreateVault()`
Create a new vault with fee calculation.

### `useDepositETH()`
Deposit ETH to a vault.

### `useDepositERC20()`
Deposit ERC20 tokens to a vault.

### `useDepositERC721()`
Deposit ERC721 NFTs to a vault.

### `useUpdateActivity()`
Update vault activity timestamp.

### `useUpdateHeir()`
Update vault heir address.

### `useCanDistribute(vaultAddress)`
Check if vault is ready for distribution.

### `useTimeUntilDistribution(vaultAddress)`
Get time remaining until distribution.

## 🔧 Utility Functions

### `calculateCreationFees(depositAmount, estimatedNFTCount)`
Calculate total fees for vault creation.

### `validateCreateVaultParams(params)`
Validate vault creation parameters.

### `formatTimeUntilDistribution(seconds)`
Format seconds into human-readable time.

### `formatEtherValue(value, decimals)`
Format ether values with proper decimals.

### `calculateVaultAge(lastActiveTimestamp)`
Calculate vault age in days.

### `isVaultReadyForDistribution(lastActiveTimestamp, inactivityPeriod, executed)`
Check if vault can distribute assets.

## 🎯 Component Props

### CreateVaultForm Props
```tsx
interface CreateVaultFormProps {
  onSuccess?: (vaultAddress: string) => void;
  onError?: (error: Error) => void;
}
```

### VaultCard Props
```tsx
interface VaultCardProps {
  vaultAddress: Address;
  showActions?: boolean;
  onDeposit?: (vaultAddress: Address) => void;
  onUpdate?: (vaultAddress: Address) => void;
  onDistribute?: (vaultAddress: Address) => void;
}
```

### VaultManager Props
```tsx
interface VaultManagerProps {
  userAddress?: Address;
  showCreateForm?: boolean;
}
```

## 🔄 Error Handling

All hooks and components include proper error handling. Errors are returned as:

```typescript
interface ContractError {
  code: string;
  message: string;
  data?: unknown;
}
```

## 📊 Fee Structure

The vault creation includes:

- **Base Creation Fee**: Percentage of deposit amount
- **NFT Fee**: Additional fee for NFT storage
- **Total Required**: Deposit + Base Fee + NFT Fee

Use `calculateCreationFees()` utility to get exact amounts before transaction.

## 🎨 Styling

Components use Tailwind CSS classes. Customize styles by modifying the component files or extending with additional CSS classes.

## 🔗 Contract Integration

The integration supports all main contract features:

- Vault creation with fee calculation
- ETH, ERC20, ERC721, and ERC1155 deposits
- Activity management
- Inheritance distribution
- Vault registry integration
- Event listening for real-time updates

## 📱 Responsive Design

All components are fully responsive and work on:
- Desktop (grid layout)
- Tablet (2-column layout)
- Mobile (single column layout)

## 🧪 Testing

Components include loading states, error states, and proper error boundaries for production use.

## 🚨 Security Notes

- All address validation is client-side only
- Always verify transactions on wallet
- Contract addresses must be updated for your deployment
- Never expose private keys or sensitive data
