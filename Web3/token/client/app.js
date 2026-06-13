// Replace with your deployed contract address after: truffle migrate
const contractAddress = "YOUR_CONTRACT_ADDRESS";

const contractABI = [
  { "inputs": [{ "internalType": "uint256", "name": "initialSupply", "type": "uint256" }], "stateMutability": "nonpayable", "type": "constructor" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "tokenOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Mint", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }
];

let web3;
let contract;
let account;
let decimals = 18;

function showStatus(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `status ${type}`;
}

function toUnits(amount) {
  return (BigInt(Math.round(parseFloat(amount))) * (10n ** BigInt(decimals))).toString();
}

function fromUnits(raw) {
  const val = BigInt(raw);
  const d = 10n ** BigInt(decimals);
  const whole = val / d;
  const frac = val % d;
  if (frac === 0n) return whole.toString();
  return `${whole}.${frac.toString().padStart(decimals, "0").replace(/0+$/, "")}`;
}

async function refreshInfo() {
  if (!contract || !account) return;
  try {
    const [name, symbol, total, balance, dec] = await Promise.all([
      contract.methods.name().call(),
      contract.methods.symbol().call(),
      contract.methods.totalSupply().call(),
      contract.methods.balanceOf(account).call(),
      contract.methods.decimals().call()
    ]);
    decimals = parseInt(dec);
    document.getElementById("tokenName").textContent    = name;
    document.getElementById("tokenSymbol").textContent  = symbol;
    document.getElementById("totalSupply").textContent  = `${fromUnits(total)} ${symbol}`;
    document.getElementById("myBalance").textContent    = `${fromUnits(balance)} ${symbol}`;
  } catch (err) {
    console.error("Failed to load token info:", err);
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
    await refreshInfo();
    ethereum.on("accountsChanged", async (a) => { account = a[0]; document.getElementById("account").textContent = `Connected: ${account}`; await refreshInfo(); });
  } catch (err) {
    console.error(err);
    alert("Wallet connection failed.");
  }
}

async function mintTokens() {
  const to = document.getElementById("mintTo").value.trim();
  const amount = document.getElementById("mintAmount").value;
  if (!web3.utils.isAddress(to)) { showStatus("mintStatus", "Invalid recipient address.", "error"); return; }
  if (!amount || parseFloat(amount) <= 0) { showStatus("mintStatus", "Enter a valid amount.", "error"); return; }
  try {
    showStatus("mintStatus", "Minting...", "");
    await contract.methods.mint(to, toUnits(amount)).send({ from: account });
    showStatus("mintStatus", `Minted ${amount} STK to ${to}`, "success");
    document.getElementById("mintTo").value = "";
    document.getElementById("mintAmount").value = "";
    await refreshInfo();
  } catch (err) {
    const msg = err.message.includes("Only owner") ? "Only the contract owner can mint." : err.message;
    showStatus("mintStatus", "Mint failed: " + msg, "error");
  }
}

async function transferTokens() {
  const to = document.getElementById("transferTo").value.trim();
  const amount = document.getElementById("transferAmount").value;
  if (!web3.utils.isAddress(to)) { showStatus("transferStatus", "Invalid recipient address.", "error"); return; }
  if (!amount || parseFloat(amount) <= 0) { showStatus("transferStatus", "Enter a valid amount.", "error"); return; }
  try {
    showStatus("transferStatus", "Sending transfer...", "");
    await contract.methods.transfer(to, toUnits(amount)).send({ from: account });
    showStatus("transferStatus", `Transferred ${amount} STK successfully!`, "success");
    document.getElementById("transferTo").value = "";
    document.getElementById("transferAmount").value = "";
    await refreshInfo();
  } catch (err) {
    const msg = err.message.includes("Insufficient") ? "Insufficient token balance." : err.message;
    showStatus("transferStatus", "Transfer failed: " + msg, "error");
  }
}

async function approveSpender() {
  const spender = document.getElementById("spenderAddress").value.trim();
  const amount = document.getElementById("approveAmount").value;
  if (!web3.utils.isAddress(spender)) { showStatus("approveStatus", "Invalid spender address.", "error"); return; }
  if (amount === "" || parseFloat(amount) < 0) { showStatus("approveStatus", "Enter a valid allowance amount.", "error"); return; }
  try {
    showStatus("approveStatus", "Approving...", "");
    await contract.methods.approve(spender, toUnits(amount)).send({ from: account });
    showStatus("approveStatus", `Approved ${amount} STK for ${spender}`, "success");
    document.getElementById("spenderAddress").value = "";
    document.getElementById("approveAmount").value = "";
  } catch (err) {
    showStatus("approveStatus", "Approve failed: " + err.message, "error");
  }
}

async function burnTokens() {
  const amount = document.getElementById("burnAmount").value;
  if (!amount || parseFloat(amount) <= 0) { showStatus("burnStatus", "Enter a valid amount to burn.", "error"); return; }
  try {
    showStatus("burnStatus", "Burning tokens...", "");
    await contract.methods.burn(toUnits(amount)).send({ from: account });
    showStatus("burnStatus", `Burned ${amount} STK from your balance.`, "success");
    document.getElementById("burnAmount").value = "";
    await refreshInfo();
  } catch (err) {
    const msg = err.message.includes("Insufficient") ? "Insufficient balance to burn." : err.message;
    showStatus("burnStatus", "Burn failed: " + msg, "error");
  }
}
