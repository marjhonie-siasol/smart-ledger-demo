# 🪙 Smart Ledger Demo

A professional, educational Web3 application built to demonstrate the full lifecycle of a blockchain-integrated web app. This project connects an **Angular** frontend to a local **Hardhat** Ethereum network, allowing users to interact with custom **ERC-20** smart contracts in real-time.

---

## 🚀 Key Features

- **Reactive Wallet Integration**: Seamlessly connects to MetaMask using **Angular Signals** for real-time UI updates upon account or network changes.
- **ERC-20 Operations**: Full support for interacting with a custom `DemoToken (DMT)` contract, including:
  - **Dynamic Balance Tracking**: Real-time ETH and DMT balance monitoring.
  - **Token Minting**: One-click minting of demo tokens to the connected wallet.
  - **Secure Transfers**: Send DMT tokens to any valid Ethereum address with instant refresh.
- **Modern Dashboard**: A premium, dark-mode specialized UI built with **Tailwind CSS v4**.
- **Secure Architecture**: Implements best practices for environment variable management and secret protection.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Angular 21, TypeScript, Tailwind CSS 4.2 |
| **Blockchain** | Solidity, Hardhat, ethers.js v6 |
| **Wallet** | MetaMask (EIP-1193) |
| **Security** | Dotenv, .gitignore secret protection |

---

## 📋 Prerequisites

Before running the application, ensure you have the following installed:
1. [Node.js](https://nodejs.org/) (v18+ recommended)
2. [MetaMask Browser Extension](https://metamask.io/)
3. [Git](https://git-scm.com/)

### MetaMask Setup
To interact with the local blockchain:
- **Add Network**: 
  - Network Name: `Hardhat Local`
  - RPC URL: `http://127.0.0.1:8545`
  - Chain ID: `31337`
  - Currency Symbol: `ETH`

---

## ⚙️ Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-ledger-demo.git
   cd smart-ledger-demo
   ```

2. **Install Dependencies**
   ```bash
   # Root directory (Frontend)
   npm install

   # Contracts directory (Blockchain)
   cd contracts
   npm install
   ```

3. **Configure Environment Variables**
   Inside the `contracts/` directory:
   - Copy `.env.example` to `.env`.
   - Add your testnet keys if planning to deploy to Sepolia (optional for local dev).

---

## 🔄 Development Workflow (The 3-Terminal Guide)

To run the full application locally, you must use three separate terminals:

### Terminal 1: Start the Local Blockchain
```bash
cd contracts
npx hardhat node
```
*Note: This generates 20 test accounts with 10,000 ETH each.*

### Terminal 2: Deploy the Smart Contract
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```
*Note: Copy the deployed contract address and update it in `src/app/contracts/demo-token.ts` if it changes.*

### Terminal 3: Launch the Angular Web App
```bash
npm start
```
*Navigate to `http://localhost:4200` to start exploring.*

---

## 🛡️ Security

This project is built with security in mind. 
- **Secret Protection**: All sensitive data (Private Keys, API Keys) is stored in `.env` files.
- **Git Ignore**: The `.gitignore` is pre-configured to ensure no secrets are ever committed to version control.
- **Dynamic Config**: `hardhat.config.ts` dynamically handles missing environment variables to prevent build crashes for new contributors.

---

## 📈 Roadmap

- [x] Phase 1: Reactive Wallet & Token Flow (Angular Signals)
- [x] Phase 2: Token Transfer Functionality (ERC-20)
- [ ] Phase 3: Session Activity Ledger
- [ ] Phase 4: UI/UX Polishing & Transaction Feedback

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
