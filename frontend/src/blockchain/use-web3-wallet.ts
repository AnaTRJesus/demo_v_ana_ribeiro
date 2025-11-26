import { useState, useEffect } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWeb3Wallet = () => {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts.length) setAddress(accounts[0]);
    });
  }, []);

  const connect = async () => {
    if (!window.ethereum) throw new Error("MetaMask not installed");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAddress(accounts[0]);
  };

  return {
    address,
    isConnected: !!address,
    connect,
  };
};
