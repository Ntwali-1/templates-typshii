# Exam Questions — SimpleToken DApp
### Lab Manual | Solidity ERC-20-Style Token
**Prepared by: RCA | Teacher: Awet Fesseha**

---

## Contract Overview

The **SimpleToken** contract implements a basic fungible token with minting (owner only), transfer, approval, delegated transfer (`transferFrom`), and burn. It mirrors the core ERC-20 standard functions and events.

---

## Section A — Important Questions for Students

1. What is a fungible token? How does it differ from a Non-Fungible Token (NFT)?

2. What is the ERC-20 standard, and why was it introduced to the Ethereum ecosystem?

3. Explain the role of the `decimals` variable in the SimpleToken contract. Why is 18 the conventional value?

4. What is **token minting**? Why should minting be restricted to the contract owner?

5. Describe the difference between `transfer` and `transferFrom`. When would you use each in a real application?

6. What is the **allowance mechanism**? Provide a real-world analogy (e.g., bank authorization).

7. Explain the `Transfer` event. Why is it emitted with `address(0)` as the sender during minting?

8. What is a **Solidity modifier**? How does `onlyOwner` improve both code security and readability?

9. How does `totalSupply` change when `mint` is called? What happens to it when `burn` is called?

10. What would happen if the `require(balanceOf[msg.sender] >= amount)` check was removed from `transfer`?

11. Describe how a decentralized exchange (DEX) like Uniswap uses `approve` and `transferFrom` to swap tokens on behalf of a user.

12. What is the difference between `public` and `external` function visibility in Solidity?

13. If `initialSupply = 1,000,000` and `decimals = 18`, how many smallest token units are created at deployment?

14. How would you implement a **burn function** to permanently destroy tokens? What state variables change?

15. What are the risks of centralizing minting authority to a single owner address (centralization risk)?

16. What does the `Approval` event signal, and how can a frontend DApp listen for it using Web3.js?

17. Why are **mappings** preferred over arrays for storing token balances and allowances?

18. In `transferFrom`, how does the contract verify that the caller has permission to spend another account's tokens?

19. What happens if a user calls `approve(spender, 0)`? Is this a valid and meaningful operation?

20. How would you extend this token to support a **deflationary model** where a percentage of every transfer is burned?

---

## Section B — Important Questions from the Code

1. In the constructor, why is `initialSupply` multiplied by `(10 ** uint256(decimals))` before assigning to `totalSupply`?

2. What does `mapping(address => mapping(address => uint256)) public allowance` represent? Draw a table to visualize two levels of mapping.

3. Why does the `_mint` private function emit **two events** — `Mint` and `Transfer`?

4. In `transfer`, explain the `-=` and `+=` operations on `balanceOf`. Could these underflow or overflow in Solidity 0.8.x?

5. In `transferFrom`, what is the required order of operations (check allowance → deduct allowance → update balances)? Why does this order matter?

6. What would happen if the `require(to != address(0))` check was removed from the `transfer` function?

7. What is the role of the `Approval` event in the ERC-20 standard, and when exactly is it emitted in this contract?

8. How does the `onlyOwner` modifier work internally? What does the `_;` placeholder mean?

9. In `app.js`, how would you convert a raw token balance (stored in smallest units) to a human-readable number with 18 decimals for display in the UI?

10. Why does `emit Transfer(address(0), to, amount)` appear inside the `_mint` function? What does this communicate to token indexers?

11. The `allowance` mapping is `public`. What getter function does Solidity auto-generate for it? What arguments does it require?

12. In Web3.js, which method would you call to send a `transfer` transaction? Write the JavaScript call.

13. The classic **approve/transferFrom race condition** exists in ERC-20. What is it, and how could it be mitigated (e.g., using `increaseAllowance`)?

14. If two transactions from the same account attempt to call `transfer` simultaneously with the full balance, what does Ethereum's sequential transaction model guarantee?

15. What does `balanceOf[someAddress]` return for an address that has never received tokens? Explain Solidity's default mapping values.

16. In `2_deploy_token.js`, why is `initialSupply` passed as a constructor argument rather than hardcoded in the contract?

17. What happens to `totalSupply` and `balanceOf[msg.sender]` when `burn(amount)` is called?

18. How would the frontend detect a `Transfer` event in real time and refresh the displayed balance automatically?

19. If `allowance[from][msg.sender]` is `100` and `amount` is `150`, what does `transferFrom` do? Which `require` fails?

20. The `owner` variable is `public`. What Solidity-generated function does this create, and how would you call it from Web3.js?
