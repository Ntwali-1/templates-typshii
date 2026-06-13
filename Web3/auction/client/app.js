// Replace with your deployed contract address after: truffle migrate
const contractAddress = "YOUR_CONTRACT_ADDRESS";

const contractABI = [
  { "inputs": [{ "internalType": "string", "name": "_itemName", "type": "string" }, { "internalType": "uint256", "name": "durationSeconds", "type": "uint256" }], "stateMutability": "nonpayable", "type": "constructor" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "winner", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "AuctionEnded", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "bidder", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "BidPlaced", "type": "event" },
  { "inputs": [], "name": "auctionEndTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "bid", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [], "name": "endAuction", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "ended", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getContractBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "highestBid", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "highestBidder", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "itemName", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "pendingReturns", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "timeRemaining", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "withdraw", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }
];

let web3;
let contract;
let account;
let timerInterval;

function showStatus(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `status ${type}`;
}

function formatTime(seconds) {
  const s = parseInt(seconds);
  if (s <= 0) return "ENDED";
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  return `${String(m).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
}

async function refreshStatus() {
  if (!contract) return;
  try {
    const [item, highBid, highBidder, ended, balance, timeLeft] = await Promise.all([
      contract.methods.itemName().call(),
      contract.methods.highestBid().call(),
      contract.methods.highestBidder().call(),
      contract.methods.ended().call(),
      contract.methods.getContractBalance().call(),
      contract.methods.timeRemaining().call()
    ]);
    document.getElementById("itemName").textContent      = item;
    document.getElementById("highestBid").textContent    = `${web3.utils.fromWei(highBid, "ether")} ETH`;
    document.getElementById("highestBidder").textContent = highBidder === "0x0000000000000000000000000000000000000000" ? "No bids yet" : highBidder;
    document.getElementById("contractBalance").textContent = `${web3.utils.fromWei(balance, "ether")} ETH`;
    document.getElementById("auctionStatus").textContent  = ended ? "Closed" : (parseInt(timeLeft) > 0 ? "Open" : "Expired — awaiting close");
    document.getElementById("timer").textContent = formatTime(timeLeft);
  } catch (err) {
    console.error("Failed to refresh auction status:", err);
  }
}

async function connectWallet() {
  if (!window.ethereum) { alert("Please install MetaMask!"); return; }
  web3 = new Web3(window.ethereum);
  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    account = accounts[0];
    document.getElementById("account").textContent = `Connected: ${account}`;
    contract = new web3.eth.Contract(contractABI, contractAddress);
    await refreshStatus();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(refreshStatus, 5000);
    ethereum.on("accountsChanged", (a) => { account = a[0]; document.getElementById("account").textContent = `Connected: ${account}`; });
  } catch (err) {
    console.error(err);
    alert("Wallet connection failed.");
  }
}

async function placeBid() {
  const amount = document.getElementById("bidAmount").value;
  if (!amount || parseFloat(amount) <= 0) { showStatus("bidStatus", "Please enter a valid bid amount.", "error"); return; }
  try {
    showStatus("bidStatus", "Submitting bid...", "");
    const weiValue = web3.utils.toWei(amount, "ether");
    await contract.methods.bid().send({ from: account, value: weiValue });
    showStatus("bidStatus", `Bid of ${amount} ETH placed successfully!`, "success");
    document.getElementById("bidAmount").value = "";
    await refreshStatus();
  } catch (err) {
    const msg = err.message.includes("exceed") ? "Bid must exceed the current highest bid."
      : err.message.includes("ended") ? "The auction has already ended."
      : "Bid failed: " + (err.message || "Unknown error");
    showStatus("bidStatus", msg, "error");
  }
}

async function withdrawFunds() {
  try {
    showStatus("withdrawStatus", "Withdrawing...", "");
    const pending = await contract.methods.pendingReturns(account).call();
    if (parseInt(pending) === 0) { showStatus("withdrawStatus", "No funds available to withdraw.", "error"); return; }
    await contract.methods.withdraw().send({ from: account });
    showStatus("withdrawStatus", `Withdrawn ${web3.utils.fromWei(pending, "ether")} ETH to your wallet!`, "success");
    await refreshStatus();
  } catch (err) {
    showStatus("withdrawStatus", "Withdrawal failed: " + (err.message || "Unknown error"), "error");
  }
}

async function endAuction() {
  try {
    showStatus("endStatus", "Ending auction...", "");
    await contract.methods.endAuction().send({ from: account });
    showStatus("endStatus", "Auction ended. Funds transferred to owner.", "success");
    if (timerInterval) clearInterval(timerInterval);
    await refreshStatus();
  } catch (err) {
    const msg = err.message.includes("Only the owner") ? "Only the contract owner can end the auction."
      : err.message.includes("not yet over") ? "Auction period has not expired yet."
      : err.message.includes("already been ended") ? "Auction has already been ended."
      : "Failed: " + (err.message || "Unknown error");
    showStatus("endStatus", msg, "error");
  }
}
