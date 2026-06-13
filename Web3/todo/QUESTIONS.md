# Exam Questions — Decentralized Todo List DApp
### Lab Manual | Solidity On-Chain Task Manager
**Prepared by: RCA | Teacher: Awet Fesseha**

---

## Contract Overview

The **TodoList** contract stores tasks permanently on the Ethereum blockchain. Each task has an ID, content string, completion status, and creator address. Only the task's creator can toggle its completion. Events are emitted on creation and status change to keep the frontend in sync.

---

## Section A — Important Questions for Students

1. What are the trade-offs of storing data **on-chain** versus **off-chain** in a DApp? Give two advantages and two disadvantages of on-chain storage.

2. Why would you choose a blockchain for a to-do list instead of a traditional centralized database? What properties does this add?

3. Explain the `TaskCreated` and `TaskToggled` events. How do they help the frontend stay synchronized with the blockchain state?

4. What is a **Solidity struct**? How is the `Task` struct used to group related data in this contract?

5. Why is `taskCount` used as the mapping key instead of a dynamic array index? What is the key difference between mappings and arrays in Solidity?

6. What does the check `require(bytes(_content).length > 0)` prevent in the `createTask` function?

7. Explain the `require(task.creator == msg.sender)` check in `toggleTask`. What rule does it enforce and why is it important?

8. What is the difference between `storage` and `memory` in Solidity? Provide an example from this contract where each is used and explain the consequence of choosing the wrong one.

9. Why are **events** more gas-efficient than mappings for storing historical data such as task history?

10. What happens to the on-chain state if a user calls `toggleTask` on the same task **three times** in a row?

11. How would you extend this contract to allow **task deletion**? What challenges arise when deleting data from a blockchain?

12. What is the **gas cost implication** of storing a long `string` on-chain compared to a short one?

13. Why is the `creator` field stored inside the `Task` struct rather than tracked in a separate mapping?

14. Walk through the exact **state change** that occurs when `toggleTask` is called on a task that is currently `false` (incomplete).

15. How would the frontend retrieve **all tasks** if the contract only provides access by ID? Is this approach efficient, and how could it be improved?

16. What **security issue** arises if the `require(task.creator == msg.sender)` check is removed from `toggleTask`?

17. How would you add a **due date** feature to this contract? What Solidity type would you use and what validation would you add?

18. Why does `taskCount` start at `0` and get incremented to `1` before the first task is stored? What would go wrong if you stored tasks starting at index 0?

19. Describe how the frontend DApp listens for `TaskCreated` events to automatically add new tasks to the UI without a page refresh.

20. What are the **privacy implications** of using a public blockchain to store a personal to-do list? How could you add basic privacy?

---

## Section B — Important Questions from the Code

1. In `createTask`, why is `taskCount++` executed **before** the task is assigned to `tasks[taskCount]`?

2. What does `Task storage task = tasks[_taskId]` mean? Why is `storage` used instead of `memory`, and what happens if you change it?

3. In `toggleTask`, what does `task.completed = !task.completed` do exactly? What is the value before and after if it starts as `false`?

4. What is the purpose of `require(_taskId > 0 && _taskId <= taskCount)` in `toggleTask`? What would happen without it?

5. Why does the `TaskCreated` event index both `id` and `creator`? What does the `indexed` keyword enable for event consumers?

6. If you call `tasks[999]` on a non-existent task ID, what values does Solidity return for each field? Explain Solidity's default values.

7. What does `bytes(_content).length` measure — the number of characters or the number of bytes? Does this matter for multi-byte characters (e.g., emoji)?

8. How does `mapping(uint256 => Task) public tasks` enable task retrieval by ID? What getter function does Solidity auto-generate for it?

9. What is the difference between `TaskCreated` and `TaskToggled` in terms of the data they emit and the state they signal?

10. In `app.js`, how would you iterate over all tasks and display them in the UI, given that the contract only exposes tasks by individual ID?

11. Why is `creator` indexed in the `TaskCreated` event but `content` is not? What would be the cost of indexing a `string`?

12. In Web3.js, how would you filter `TaskCreated` events to display **only the tasks created by the currently connected wallet**?

13. What does `createTask("")` (empty string) do? Which line of the contract catches this and what error message is returned?

14. When a new `Task` is created via `tasks[taskCount] = Task(taskCount, _content, false, msg.sender)`, what is the default value of `completed` before it is explicitly set to `false`?

15. If two users submit `createTask` transactions in the same Ethereum block, what task IDs do they receive? Can two tasks ever have the same ID?

16. In `2_deploy_todo.js`, why does `TodoList` not require any constructor arguments, unlike the `Auction` or `SimpleToken` contracts?

17. How would you modify `toggleTask` to allow an **admin address** to toggle any task regardless of who created it?

18. Estimate the gas cost difference between calling `createTask` with a 10-character string versus a 500-character string. What EVM concept explains this?

19. In the frontend `app.js`, what does `task.creator.slice(0,6)...task.creator.slice(-4)` produce, and why is this displayed instead of the full address?

20. What would you change in both the smart contract and the frontend to allow each address to maintain its **own private, numbered task list** that other users cannot see or modify?
