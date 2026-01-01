# 🔐 QIE Vault: ERC-1155 Dynamic Access Control

## Project Overview

QIE Vault is a decentralized application (dApp) built on the QIE Chain that reimagines secure document access and identity management. Leveraging the ERC-1155 multi-token standard, QIE Vault empowers administrators to securely store sensitive resources on IPFS and manage access permissions with unprecedented flexibility and control.

Unlike traditional systems, QIE Vault uses non-transferable (soulbound) identity NFTs as digital keys, ensuring that access can be granted, revoked, and managed dynamically directly on-chain.

## ✨ Core Features

* **Dual-Mode Access Control:** Administrators can choose between two distinct access modes when vaulting a document:
    * **Exclusive Mode:** Only one wallet can hold the access key at any given time, ensuring strict single-owner control over sensitive resources. The Admin retains the master override to reclaim or reassign this key.
    * **Broadcast Mode:** Multiple users can be issued individual access keys for the same document, facilitating collaborative access or broad distribution without compromising security.
* **Decentralized Storage (IPFS):** All documents are securely uploaded and stored on IPFS, ensuring data integrity, censorship resistance, and availability.
* **Soulbound Access Keys:** Identity NFTs are non-transferable by the end-user (ERC-1155 `safeTransferFrom` override). This prevents unauthorized sharing or resale of access, enhancing security.
* **Dynamic Grant & Revoke:** Administrators can issue new access keys to additional users at any time or instantly revoke access from specific wallets by burning their corresponding identity NFT.
* **Administrative Master Override:** In Exclusive Mode, the document creator (Admin) can always reclaim the access key from any current holder through a "burn and re-mint" mechanism, guaranteeing ultimate control.
* **Intuitive UI:** A clean, minimalist user interface inspired by Apple's design principles ensures a seamless and professional user experience for both administrators and document viewers.
* **QIE Chain Integration:** Built on the QIE Chain for fast, low-cost transactions and rapid finality, making dynamic access management efficient and practical.

## 🚀 How It Works

1.  **Vault Resource:** An Admin uploads a document (e.g., a PDF, image, legal contract) via the dApp. The document is stored on IPFS, and its unique CID (Content Identifier) is recorded on the QIE Chain.
2.  **Mint Master Key:** Concurrently, an ERC-1155 "Master Key" NFT is minted to the Admin's wallet, linking them as the primary owner of that document's access permissions. The Admin selects either "Exclusive" or "Broadcast" mode.
3.  **Grant Access (Issue Keys):**
    * **Exclusive Mode:** If the Admin wishes to grant access to a single user, the system performs a "burn-and-remint" operation, moving the sole access key from the current holder (Admin or previous user) to the new designated user.
    * **Broadcast Mode:** The Admin can mint new, unique access keys (ERC-1155 tokens) for multiple specified wallet addresses. Each user receives their own non-transferable key.
4.  **User Verification:** A user enters a Document ID. The dApp checks their wallet for the corresponding ERC-1155 access key on the QIE Chain.
5.  **Access Granted:** If the user holds a valid key, the dApp retrieves the IPFS CID from the smart contract and displays the secure document.
6.  **Revoke Access:** The Admin can burn a specific user's access key at any time, instantly revoking their permission to view the document.

## ⚙️ Technical Stack

* **Smart Contract:** Solidity (ERC-1155, Ownable from OpenZeppelin)
* **Blockchain:** QIE Chain
* **Frontend:** HTML, CSS (minimalist, Apple-inspired design), JavaScript (Ethers.js for blockchain interaction)
* **Decentralized Storage:** Pinata (for IPFS pinning)

## 🏗️ Setup and Installation

### Prerequisites

* MetaMask browser extension
* Access to QIE Chain RPC endpoint (e.g., for deployment and interaction)
* Pinata API Key & Secret (for IPFS uploads)

### Steps

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/thekrishnajeena/qie-vault.git]
    cd qie-vault
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Configure Pinata (in `app.js`):**
    Open `app.js` and update `PINATA_API_KEY` and `PINATA_SECRET_KEY` with your credentials.
4.  **Deploy the Smart Contract:**
    * Compile `QIEVaultPro.sol` using Remix or Hardhat.
    * Deploy it to the QIE Chain.
    * **Crucially, copy the deployed contract address.**
5.  **Update `CONTRACT_ADDRESS` (in `app.js`):**
    Open `app.js` and replace `"0xYour_Latest_Contract_Address"` with the actual address of your deployed `QIEVaultPro` contract.
6.  **Generate ABI:**
    If you deployed via Remix, copy the ABI JSON from the `Compile` tab. If using Hardhat, it's typically in `artifacts/contracts/QIEVaultPro.sol/QIEVaultPro.json`.
    Create an `abi.js` file in your project root:
    ```javascript
    export const ABI = [
        // Paste your ABI JSON here
        // Ensure the createDocument signature is:
        // function createDocument(uint256 documentId, string memory ipfsCid, bool singleMode)
        // Ensure the grantAccess signature is:
        // function grantAccess(address[] memory users, uint256 documentId)
    ];
    ```
7.  **Run the dApp:**
    Open `index.html` in your web browser. (For local development, you might want to use a simple HTTP server like `serve` if you encounter CORS issues: `npm install -g serve` then `serve .`)

## 🎬 Demo Instructions

1.  **Connect Wallet:** Click "Connect Wallet" on the dApp.
2.  **Admin Console:**
    * **Vault Resource:** Enter a unique `Internal ID`, select `Exclusive Mode` or `Broadcast Mode`, choose a file, and click "Vault Resource". Observe the status.
    * **Grant Access:** Enter the `Document ID` you just created. Paste one or more wallet addresses (comma-separated for Broadcast mode) into "Recipient Wallets." Click "Issue Identity Key."
    * **Revoke Access:** Enter the `Document ID` and the specific `User Wallet Address` to revoke. Click "Revoke Access."
3.  **Vault Access (User Perspective):**
    * Switch your MetaMask to a viewer wallet that was granted access.
    * Go to the "Vault Access" tab.
    * Enter the `Document ID` and click "Request Access." The document (from IPFS) should load in the iframe.
    * Switch to a wallet **without** access and try again. Access should be denied.

## 🤝 Contribution

Feel free to fork the project and experiment. Contributions and suggestions are welcome!

## 📜 License

This project is licensed under the MIT License.