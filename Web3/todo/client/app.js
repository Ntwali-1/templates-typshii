// Replace with your deployed contract address after: truffle migrate
const contractAddress = "YOUR_CONTRACT_ADDRESS";

const contractABI = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "content", "type": "string" }, { "indexed": true, "internalType": "address", "name": "creator", "type": "address" }], "name": "TaskCreated", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": false, "internalType": "bool", "name": "completed", "type": "bool" }], "name": "TaskToggled", "type": "event" },
  { "inputs": [{ "internalType": "string", "name": "_content", "type": "string" }], "name": "createTask", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_taskId", "type": "uint256" }], "name": "getTask", "outputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "string", "name": "content", "type": "string" }, { "internalType": "bool", "name": "completed", "type": "bool" }, { "internalType": "address", "name": "creator", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "taskCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "tasks", "outputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "string", "name": "content", "type": "string" }, { "internalType": "bool", "name": "completed", "type": "bool" }, { "internalType": "address", "name": "creator", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_taskId", "type": "uint256" }], "name": "toggleTask", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

let web3;
let contract;
let account;

function showStatus(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `status ${type}`;
}

async function connectWallet() {
  if (!window.ethereum) { alert("Please install MetaMask!"); return; }
  web3 = new Web3(window.ethereum);
  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    account = accounts[0];
    document.getElementById("account").textContent = `Connected: ${account}`;
    contract = new web3.eth.Contract(contractABI, contractAddress);
    await loadTasks();
    ethereum.on("accountsChanged", async (a) => { account = a[0]; document.getElementById("account").textContent = `Connected: ${account}`; await loadTasks(); });
  } catch (err) {
    console.error(err);
    alert("Wallet connection failed.");
  }
}

async function loadTasks() {
  if (!contract) { alert("Connect your wallet first."); return; }
  try {
    const count = parseInt(await contract.methods.taskCount().call());
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    if (count === 0) {
      list.innerHTML = '<li style="color:#888;font-size:0.88rem;padding:10px 0;">No tasks yet. Create your first task above!</li>';
      document.getElementById("totalCount").textContent   = "0";
      document.getElementById("doneCount").textContent    = "0";
      document.getElementById("pendingCount").textContent = "0";
      return;
    }

    let done = 0;
    for (let i = 1; i <= count; i++) {
      const task = await contract.methods.getTask(i).call();
      if (task.completed) done++;

      const li = document.createElement("li");
      li.className = "task-item";

      const idSpan = document.createElement("span");
      idSpan.className = "task-id";
      idSpan.textContent = `#${task.id}`;

      const textWrap = document.createElement("div");
      textWrap.style.flex = "1";

      const contentSpan = document.createElement("div");
      contentSpan.className = `task-content${task.completed ? " done" : ""}`;
      contentSpan.textContent = task.content;

      const creatorSpan = document.createElement("div");
      creatorSpan.className = "task-creator";
      creatorSpan.textContent = `by ${task.creator.slice(0,6)}...${task.creator.slice(-4)}`;

      textWrap.appendChild(contentSpan);
      textWrap.appendChild(creatorSpan);

      const badge = document.createElement("span");
      badge.className = `task-badge ${task.completed ? "badge-done" : "badge-pending"}`;
      badge.textContent = task.completed ? "Done" : "Pending";

      const btn = document.createElement("button");
      btn.className = "toggle-btn";
      btn.textContent = task.completed ? "Undo" : "Complete";
      const taskId = parseInt(task.id);
      const isOwner = task.creator.toLowerCase() === account.toLowerCase();
      btn.disabled = !isOwner;
      btn.title = isOwner ? "Toggle task status" : "Only the creator can toggle this task";
      btn.onclick = () => toggleTask(taskId);

      li.appendChild(idSpan);
      li.appendChild(textWrap);
      li.appendChild(badge);
      li.appendChild(btn);
      list.appendChild(li);
    }

    document.getElementById("totalCount").textContent   = count;
    document.getElementById("doneCount").textContent    = done;
    document.getElementById("pendingCount").textContent = count - done;
  } catch (err) {
    console.error("Failed to load tasks:", err);
    showStatus("toggleStatus", "Error loading tasks. Check console.", "error");
  }
}

async function createTask() {
  const content = document.getElementById("taskInput").value.trim();
  if (!content) { showStatus("createStatus", "Please enter task content.", "error"); return; }
  try {
    showStatus("createStatus", "Creating task on-chain...", "");
    await contract.methods.createTask(content).send({ from: account });
    showStatus("createStatus", `Task "${content}" created successfully!`, "success");
    document.getElementById("taskInput").value = "";
    await loadTasks();
  } catch (err) {
    showStatus("createStatus", "Failed to create task: " + (err.message || "Unknown error"), "error");
  }
}

async function toggleTask(taskId) {
  try {
    showStatus("toggleStatus", "Updating task status...", "");
    await contract.methods.toggleTask(taskId).send({ from: account });
    showStatus("toggleStatus", `Task #${taskId} status updated!`, "success");
    await loadTasks();
  } catch (err) {
    const msg = err.message.includes("Only the task creator") ? "Only the task creator can toggle this task."
      : "Toggle failed: " + (err.message || "Unknown error");
    showStatus("toggleStatus", msg, "error");
  }
}
