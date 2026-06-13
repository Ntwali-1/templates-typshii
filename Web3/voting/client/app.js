// Replace after running: truffle migrate
const contractAddress = "YOUR_CONTRACT_ADDRESS";

let web3;
let votingContract;
let contractABI;
let currentAccount;

// Loads the ABI from the Truffle build artifact.
// Run the server from the voting/ project ROOT (not from client/):
//   cd voting && npx http-server
// Then open: http://localhost:8080/client/
async function loadABI() {
  try {
    const response = await fetch("/build/contracts/Voting.json");
    const artifact = await response.json();
    contractABI = artifact.abi;
  } catch (err) {
    console.error("Failed to load ABI:", err);
    alert("Could not load contract ABI. Make sure the server is started from the voting/ project root and you have run 'truffle compile'.");
  }
}

function showStatus(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `status ${type}`;
}

async function connectMetaMask() {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask not detected! Please install it from https://metamask.io");
    return;
  }

  try {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    currentAccount = accounts[0];
    document.getElementById("account").innerText = `Connected: ${currentAccount}`;

    if (!contractABI) await loadABI();
    if (!contractABI) return;

    votingContract = new web3.eth.Contract(contractABI, contractAddress);
    await loadCandidates();

    window.ethereum.on("accountsChanged", async (newAccounts) => {
      currentAccount = newAccounts[0];
      document.getElementById("account").innerText = `Connected: ${currentAccount}`;
      await loadCandidates();
    });
  } catch (err) {
    console.error("MetaMask connection failed:", err);
    alert("Connection failed. See console for details.");
  }
}

async function loadCandidates() {
  try {
    const count = await votingContract.methods.candidatesCount().call();
    const voted = await votingContract.methods.voters(currentAccount).call();
    const list = document.getElementById("candidates");
    list.innerHTML = "";

    for (let i = 1; i <= count; i++) {
      const c = await votingContract.methods.candidates(i).call();
      const li = document.createElement("li");
      li.className = "candidate-item";

      const nameSpan = document.createElement("span");
      nameSpan.className = "candidate-name";
      nameSpan.textContent = `#${c.id} ${c.name}`;

      const votesSpan = document.createElement("span");
      votesSpan.className = "candidate-votes";
      votesSpan.textContent = `${c.voteCount} votes`;

      const voteBtn = document.createElement("button");
      voteBtn.className = "vote-btn";
      voteBtn.textContent = voted ? "Voted" : "Vote";
      voteBtn.disabled = voted;
      voteBtn.onclick = () => vote(i);

      li.appendChild(nameSpan);
      li.appendChild(votesSpan);
      li.appendChild(voteBtn);
      list.appendChild(li);
    }
  } catch (err) {
    console.error("Error loading candidates:", err);
    showStatus("voteStatus", "Error loading candidates. Check console.", "error");
  }
}

async function vote(candidateId) {
  if (!votingContract || !currentAccount) {
    alert("Please connect your wallet first.");
    return;
  }
  try {
    showStatus("voteStatus", "Waiting for transaction confirmation...", "");
    await votingContract.methods.vote(candidateId).send({ from: currentAccount });
    showStatus("voteStatus", "Vote successfully cast!", "success");
    await loadCandidates();
  } catch (err) {
    console.error("Vote failed:", err);
    const msg = err.message.includes("Already voted")
      ? "You have already voted."
      : "Transaction failed: " + (err.message || "Unknown error");
    showStatus("voteStatus", msg, "error");
  }
}

async function addCandidate() {
  if (!votingContract || !currentAccount) {
    alert("Please connect your wallet first.");
    return;
  }
  const name = document.getElementById("candidateInput").value.trim();
  if (!name) {
    showStatus("addStatus", "Please enter a candidate name.", "error");
    return;
  }
  try {
    showStatus("addStatus", "Adding candidate...", "");
    await votingContract.methods.addNewCandidate(name).send({ from: currentAccount });
    showStatus("addStatus", `Candidate "${name}" added successfully!`, "success");
    document.getElementById("candidateInput").value = "";
    await loadCandidates();
  } catch (err) {
    console.error("Add candidate failed:", err);
    const msg = err.message.includes("Only owner")
      ? "Only the contract owner can add candidates."
      : "Failed to add candidate: " + (err.message || "Unknown error");
    showStatus("addStatus", msg, "error");
  }
}
