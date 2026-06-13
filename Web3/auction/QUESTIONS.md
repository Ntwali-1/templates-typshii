# Exam Questions — Decentralized Auction DApp
### Lab Manual | Solidity Blind Auction Smart Contract
**Prepared by: RCA | Teacher: Awet Fesseha**

---

## Contract Overview

The **Auction** contract implements a time-limited, open-bid Ethereum auction. Users place ETH bids, outbid users are credited via a **withdrawal pattern**, and the owner can finalize the auction after the deadline to transfer the winning bid to themselves.

---

## Section A — Important Questions for Students

1. What is a **decentralized auction**? What advantages does it have over traditional online auctions (e.g., eBay)?

2. What is `auctionEndTime`, and how is it calculated at the time of contract deployment?

3. Why must each new bid be strictly higher than the current `highestBid`?

4. What is the **withdrawal pattern** in Solidity? Why is it safer than directly refunding ETH to outbid users inside the `bid` function?

5. What is `block.timestamp` in Solidity? Is it perfectly accurate, and can it be manipulated?

6. Walk through what happens to the **previous highest bidder** when a new, higher bid is placed.

7. What does the `endAuction` function do, and why is access restricted to the contract owner?

8. How does the `timeRemaining` function calculate how many seconds are left in the auction?

9. What does the `ended` boolean flag prevent? What type of vulnerability does it guard against?

10. What is a **re-entrancy attack**? Does the withdrawal pattern in this contract protect against it? Explain why.

11. How would you modify this contract to allow the **auction to be cancelled** before it ends?

12. What does the `payable` keyword mean in Solidity? Why must the `bid` function be marked `payable`?

13. What happens to the contract's ETH balance after `endAuction` is successfully called?

14. Why is `pendingReturns[highestBidder] += highestBid` used instead of an immediate `transfer` inside `bid`?

15. How would you add a **minimum bid increment** (e.g., bids must increase by at least 0.01 ETH) to prevent negligible increases?

16. What is the difference between `transfer`, `send`, and `call` when sending ETH in Solidity? Which is preferred in modern Solidity?

17. How does the `BidPlaced` event help a frontend track auction activity in real time without polling the contract?

18. What would happen if `durationSeconds` was set to `0` in the constructor at deployment?

19. Describe a scenario where the `ended` flag is **critical** for preventing a double-payout vulnerability.

20. What steps would you take to deploy this contract for a **real-world auction** of a digital or physical asset?

---

## Section B — Important Questions from the Code

1. What does `auctionEndTime = block.timestamp + durationSeconds` compute? What unit is `durationSeconds` expected to be in?

2. The `bid()` function contains three `require` statements. What specific condition does each one enforce?

3. In `bid()`, why is `pendingReturns[highestBidder] += highestBid` executed **before** updating `highestBidder` and `highestBid`?

4. What would break if the condition was `require(msg.value >= highestBid)` instead of `require(msg.value > highestBid)`?

5. Explain the role of `mapping(address => uint256) public pendingReturns`. When is an entry added to it?

6. In `withdraw()`, why is `pendingReturns[msg.sender] = 0` set to zero **before** calling `payable(msg.sender).transfer(amount)`?

7. What does `timeRemaining()` return when the auction has already ended? Why does it not return a negative number?

8. In `endAuction()`, why is `require(!ended)` checked **after** checking the time? Could you swap the order?

9. What does `payable(owner).transfer(highestBid)` do? Who receives the funds and from where?

10. If no one placed a bid, what is the value of `highestBidder` after deployment? What does `endAuction` do in this case?

11. In `app.js`, how would you convert `highestBid` (returned in wei) to ETH for display in the UI?

12. How does the frontend determine whether the auction is still open, expired but not closed, or fully ended?

13. In `2_deploy_auction.js`, the constructor receives two arguments. What are they, and why are they passed at migration time rather than hardcoded?

14. What data does the `AuctionEnded` event emit, and how would the frontend use it to display the winner?

15. If a bidder calls `withdraw()` while the auction is still active, can they withdraw their bid? Explain based on the code.

16. In JavaScript, how would you **listen for the `BidPlaced` event** using Web3.js and update the UI when a new bid arrives?

17. What is the difference between `require` and `revert` in Solidity for signalling errors? When would you use each?

18. Why does the Auction contract not define a `receive()` or `fallback()` function? What happens if ETH is sent directly to it?

19. How would you modify `endAuction` so that **anyone** (not just the owner) can call it after the deadline has passed?

20. If `endAuction` is called but the contract balance is less than `highestBid` due to a bug, what happens? Is this possible in the current implementation?
