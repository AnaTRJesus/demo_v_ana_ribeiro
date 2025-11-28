import { ethers } from "ethers";

const CONTRACT_ADDRESS = import.meta.env.VITE_CERTIFICATE_CONTRACT_ADDRESS;

const ABI = [
  "function issueCertificate(uint256 studentId, string ipfsCid) external returns (uint256)",
  "function verifyCertificate(uint256 certId, uint256 studentId, string ipfsCid) external view returns (bool)"
];

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const getCertificateContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
};
