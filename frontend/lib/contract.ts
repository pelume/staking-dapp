import { ethers } from "ethers";
import StakerABI from "../abi/Staker.json";

// ...existing code...

// Narrowly type the injected provider to avoid `any`
declare global {
  interface EthereumProvider {
    request: (request: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>;
    on?: (...args: unknown[]) => void;
  }
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export const CONTRACT_ADDRESS = "0xDFC9DdAcB05a4a44E9Cf890C06E65d3dE78f9BC0";

export async function getContract() {
  if (typeof window === "undefined") {
    throw new Error("Must be used in browser");
  }

  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);

  await provider.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, StakerABI, signer);
}