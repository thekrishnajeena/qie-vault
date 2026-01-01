import { ABI } from "./abi.js";
import { CONFIG } from "./config.js";

const CONTRACT_ADDRESS = CONFIG.CONTRACT_ADDRESS;

const PINATA_API_KEY = CONFIG.PINATA_API_KEY;
const PINATA_SECRET_KEY = CONFIG.PINATA_SECRET_KEY;


let provider, signer, contract, user;

// --- UTILITIES ---

// Standardized Status display
const setStatus = (id, msg, type = "info") => { 
    const el = document.getElementById(id);
    if (!el) return;
    el.innerText = msg; 
    el.style.color = type === "error" ? "#ff3b30" : type === "success" ? "#32d74b" : "#86868b";
};

// Fixed setLoading: Manages button state and visual feedback
const setLoading = (btnId, isLoading) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    
    if (isLoading) {
        btn.disabled = true;
        btn.style.opacity = "0.6";
        btn.style.cursor = "not-allowed";
        // Store original text to restore it later
        btn.dataset.originalText = btn.innerText;
        btn.innerText = "Processing...";
    } else {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        btn.innerText = btn.dataset.originalText || "Done";
    }
};

const stringToId = (str) => BigInt(ethers.id(str.trim().toLowerCase()));

// --- CORE FUNCTIONS ---

window.connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not found");
    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        user = await signer.getAddress();
        contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        
        const walletBtn = document.getElementById("wallet");
        walletBtn.innerText = "Connected: " + user.substring(0, 8) + "...";
        walletBtn.classList.add("connected");
    } catch (e) {
        console.error("Connection failed", e);
    }
};

async function uploadToIPFS(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: 'POST',
        headers: { 'pinata_api_key': PINATA_API_KEY, 'pinata_secret_api_key': PINATA_SECRET_KEY },
        body: formData
    });
    if (!res.ok) throw new Error("IPFS Upload Failed");
    const json = await res.json();
    return json.IpfsHash;
}

// --- ACTION HANDLERS ---

window.uploadAndMint = async () => {
    const file = document.getElementById("fileInput").files[0];
    const docName = document.getElementById("docCreate").value;
    const isSingle = document.getElementById("accessMode").value === "single";
    const btnId = "btnCreate"; // Ensure your HTML button has this ID
    
    if (!file || !docName) return alert("All fields required");
    if (!contract) return alert("Please connect wallet first");

    try {
        setLoading(btnId, true);
        setStatus("ownerStatus", "Uploading to Secure Storage...");
        
        const cid = await uploadToIPFS(file);
        const docId = stringToId(docName);
        
        setStatus("ownerStatus", "Finalizing Vault on QIE Chain...");
        const tx = await contract.createDocument(docId, cid, isSingle);
        await tx.wait();
        
        setStatus("ownerStatus", "✅ Vaulting Complete.", "success");
    } catch (e) {
        setStatus("ownerStatus", "Error: " + (e.reason || e.message), "error");
    } finally {
        setLoading(btnId, false);
    }
};

window.grantAccess = async () => {
    const docName = document.getElementById("docGrant").value;
    const addressStr = document.getElementById("viewerAddr").value;
    const addrs = addressStr.split(/[, \n]+/).filter(a => ethers.isAddress(a.trim()));
    const btnId = "btnGrant";

    if (!docName || addrs.length === 0) return alert("Invalid Document Name or Addresses");

    try {
        setLoading(btnId, true);
        setStatus("ownerStatus", "Issuing Identity Keys...");
        
        const tx = await contract.grantAccess(addrs, stringToId(docName));
        await tx.wait();
        
        setStatus("ownerStatus", "✅ Identity Keys Issued.", "success");
    } catch (e) { 
        setStatus("ownerStatus", "Error: " + (e.reason || e.message), "error"); 
    } finally {
        setLoading(btnId, false);
    }
};

window.revokeAccess = async () => {
    const docName = document.getElementById("docRevoke").value;
    const target = document.getElementById("revokeAddr").value.trim();
    const btnId = "btnRevoke";

    if (!docName || !target) return alert("Missing Document Name or Target Wallet");

    try {
        setLoading(btnId, true);
        setStatus("ownerStatus", "Revoking Access...");
        
        const tx = await contract.revokeAccess(target, stringToId(docName));
        await tx.wait();
        
        setStatus("ownerStatus", "❌ Access Terminated.", "success");
    } catch (e) { 
        setStatus("ownerStatus", "Error: " + (e.reason || e.message), "error"); 
    } finally {
        setLoading(btnId, false);
    }
};

window.checkAccess = async () => {
    const docName = document.getElementById("docView").value;
    const btnId = "btnCheck";
    
    if (!docName) return alert("Enter a Document Name");

    try {
        setLoading(btnId, true);
        setStatus("viewerStatus", "Verifying Identity...");
        
        const docId = stringToId(docName);
        const allowed = await contract.canAccess(user, docId);
        
        if (allowed) {
            const cid = await contract.documentCids(docId);
            const frame = document.getElementById("docFrame");
            frame.src = `https://gateway.pinata.cloud/ipfs/${cid}`;
            frame.style.display = "block";
            setStatus("viewerStatus", "🔓 Identity Verified.", "success");
        } else {
            setStatus("viewerStatus", "🚫 Access Denied.", "error");
            document.getElementById("docFrame").style.display = "none";
        }
    } catch (e) { 
        setStatus("viewerStatus", "Identity Not Found.", "error"); 
    } finally {
        setLoading(btnId, false);
    }
};

// UI Navigation
window.showTab = (tabId, element) => {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
};