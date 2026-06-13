// Replace with your deployed contract address after running: truffle migrate
const contractAddress = "YOUR_CONTRACT_ADDRESS";

const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "applicant",
        "type": "address"
      }
    ],
    "name": "Applied",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "donor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Donated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FundsReleased",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "applicants",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "applyForScholarship",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "donate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "releaseFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalDonations",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

let web3;
let contract;
let accounts;

function showStatus(elementId, message, type) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = `status-msg ${type}`;
}

async function refreshBalance() {
  if (!contract) return;
  try {
    const balanceWei = await contract.methods.getBalance().call();
    const balanceEth = web3.utils.fromWei(balanceWei, "ether");
    document.getElementById("balance").textContent = `Contract Balance: ${parseFloat(balanceEth).toFixed(4)} ETH`;
  } catch (_) {}
}

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask is not installed. Please install it from https://metamask.io");
    return;
  }

  web3 = new Web3(window.ethereum);

  try {
    accounts = await ethereum.request({ method: "eth_requestAccounts" });

    const accountEl = document.getElementById("account");
    accountEl.textContent = `Connected: ${accounts[0]}`;
    accountEl.style.display = "block";

    contract = new web3.eth.Contract(contractABI, contractAddress);
    await refreshBalance();

    ethereum.on("accountsChanged", (newAccounts) => {
      accounts = newAccounts;
      accountEl.textContent = `Connected: ${accounts[0]}`;
      refreshBalance();
    });
  } catch (error) {
    console.error("Wallet connection denied:", error);
    alert("Wallet connection was denied.");
  }
}

async function donate() {
  if (!contract || !accounts) {
    alert("Please connect your wallet first.");
    return;
  }

  const amount = document.getElementById("donationAmount").value;
  if (!amount || parseFloat(amount) <= 0) {
    showStatus("donateStatus", "Please enter a valid donation amount.", "error");
    return;
  }

  const weiValue = web3.utils.toWei(amount, "ether");

  try {
    showStatus("donateStatus", "Waiting for transaction confirmation...", "");
    await contract.methods.donate().send({ from: accounts[0], value: weiValue });
    showStatus("donateStatus", `Donation of ${amount} ETH successful!`, "success");
    document.getElementById("donationAmount").value = "";
    await refreshBalance();
  } catch (error) {
    console.error("Donation failed:", error);
    showStatus("donateStatus", "Donation failed: " + (error.message || "Unknown error"), "error");
  }
}

async function applyForScholarship() {
  if (!contract || !accounts) {
    alert("Please connect your wallet first.");
    return;
  }

  try {
    showStatus("applyStatus", "Submitting application...", "");
    await contract.methods.applyForScholarship().send({ from: accounts[0] });
    showStatus("applyStatus", "Application submitted successfully!", "success");
  } catch (error) {
    console.error("Application failed:", error);
    const msg = error.message.includes("Already applied")
      ? "You have already applied for a scholarship."
      : "Application failed: " + (error.message || "Unknown error");
    showStatus("applyStatus", msg, "error");
  }
}

async function releaseFunds() {
  if (!contract || !accounts) {
    alert("Please connect your wallet first.");
    return;
  }

  const recipient = document.getElementById("recipientAddress").value.trim();
  const amount = document.getElementById("releaseAmount").value;

  if (!recipient || !web3.utils.isAddress(recipient)) {
    showStatus("releaseStatus", "Please enter a valid recipient address.", "error");
    return;
  }

  if (!amount || parseFloat(amount) <= 0) {
    showStatus("releaseStatus", "Please enter a valid amount to release.", "error");
    return;
  }

  const weiAmount = web3.utils.toWei(amount, "ether");

  try {
    showStatus("releaseStatus", "Releasing funds...", "");
    await contract.methods.releaseFunds(recipient, weiAmount).send({ from: accounts[0] });
    showStatus("releaseStatus", `${amount} ETH released to ${recipient}`, "success");
    document.getElementById("recipientAddress").value = "";
    document.getElementById("releaseAmount").value = "";
    await refreshBalance();
  } catch (error) {
    console.error("Fund release failed:", error);
    const msg = error.message.includes("Only admin")
      ? "Only the admin can release funds."
      : error.message.includes("Insufficient balance")
      ? "Insufficient contract balance."
      : "Release failed: " + (error.message || "Unknown error");
    showStatus("releaseStatus", msg, "error");
  }
}
