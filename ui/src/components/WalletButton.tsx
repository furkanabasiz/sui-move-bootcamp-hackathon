import { useState } from 'react';
import {
  ConnectButton,
  useCurrentAccount,
  useDisconnectWallet,
} from '@mysten/dapp-kit';
import { formatAddress } from '@/lib/utils';
import { Wallet, LogOut, Copy, ExternalLink, ChevronDown } from 'lucide-react';
import { NETWORK, EXPLORER_URL } from '@/lib/constants';

export default function WalletButton() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [showMenu, setShowMenu] = useState(false);

  const copyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      alert('Address copied!');
    }
  };

  const viewOnExplorer = () => {
    if (account?.address) {
      const url = `${EXPLORER_URL[NETWORK as keyof typeof EXPLORER_URL]}/address/${account.address}`;
      window.open(url, '_blank');
    }
  };

  if (!account) {
    return (
      <ConnectButton
        connectText="Connect Wallet"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
      />
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
      >
        <Wallet className="w-4 h-4" />
        <span className="font-medium">{formatAddress(account.address)}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">
            <div className="p-3 border-b">
              <p className="text-xs text-muted-foreground mb-1">
                Connected Wallet
              </p>
              <p className="font-mono text-sm break-all">{account.address}</p>
            </div>

            <div className="py-1">
              <button
                onClick={copyAddress}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Address
              </button>

              <button
                onClick={viewOnExplorer}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </button>

              <button
                onClick={() => {
                  disconnect();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}