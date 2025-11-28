# Blockchain Module — Student Certificate System

This module contains the smart contracts, deployment scripts, and utilities
responsible for managing **on-chain student certificates**.  
It includes:

- Certificate creation  
- Certificate storage on-chain  
- IPFS CID binding  
- On-chain verification (`verifyCertificate`)  
- Front-end integration (via Web3 / Ethers.js)

A full demonstration video showing the end-to-end on-chain operation is available below.

---

## 📺 Demo — On-Chain Operation

Watch the full video demonstrating certificate minting, storage, and verification on-chain:

🔗 https://drive.google.com/file/d/16y672joWm3KT4KNWo6BkGX5CgLFI45rr/view?usp=sharing

---

# 🚀 1. Requirements

Make sure you have the following installed:

- Node.js 18+
- NPM or Yarn
- Hardhat (JavaScript version)
- Metamask (for local/testnet interactions)
- A local blockchain (Hardhat Network or Ganache)

Clone the project and install dependencies:

```bash
npm install
```

Or:

```bash
yarn install
```

---

# 🏗 2. Project Structure

```
/blockchain
 ├── contracts/
 │    └── CertificateRegistry.sol
 ├── scripts/
 │    ├── deploy.js
 │    └── verify.js (optional)
 ├── test/
 │    └── certificate.test.js
 ├── hardhat.config.js
 └── README.md
```

---

# ⚙️ 3. Running Hardhat Locally

Start a local blockchain node:

```bash
npx hardhat node
```

---

# 📦 4. Deploying the Smart Contract (Local Network)

```bash
npx hardhat run scripts/deploy.js --network localhost
```

---

# 🔍 5. Interacting With the Contract

```ts
const contract = await getCertificateContract();
const isValid = await contract.verifyCertificate(
  Number(certId),
  Number(studentId),
  cid
);
```

---

# 🧪 6. Running Tests

```bash
npx hardhat test
```

---

# 🌐 7. Deploying to Testnet

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

# 🔗 8. Front-End Integration

```ts
import { ethers } from "ethers";
import CertificateABI from "./abi/CertificateRegistry.json";

export const getCertificateContract = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(
    import.meta.env.VITE_CERTIFICATE_CONTRACT,
    CertificateABI.abi,
    signer
  );
};
```

---

# 📄 9. Environment Variables

```
PRIVATE_KEY=your_wallet_private_key
ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/xxxxx
```

---

# 🧩 10. Useful Commands

| Action | Command |
|--------|---------|
| Compile contracts | npx hardhat compile |
| Start local node  | npx hardhat node |
| Deploy local      | npx hardhat run scripts/deploy.js --network localhost |
| Deploy testnet    | npx hardhat run scripts/deploy.js --network sepolia |

---
