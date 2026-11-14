import { createConfig, http } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { createWalletConnectors } from '@/lib/wallet/connectors';

// No WalletConnect / Reown project ID: see lib/wallet/connectors.ts.
export const config = createConfig({
  chains: [base, mainnet],
  connectors: createWalletConnectors({
    name: 'PizzaDAO Mixtape',
    url: 'https://mixtape.rarepizzas.com',
    icon: 'https://mixtape.rarepizzas.com/pizzadao-logo-white.png',
  }),
  transports: {
    [base.id]: http(),
    [mainnet.id]: http('https://ethereum-rpc.publicnode.com', { batch: false }),
  },
  ssr: true,
});
