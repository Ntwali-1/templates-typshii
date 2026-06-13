// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList {
    struct Task {
        uint256 id;
        string content;
        bool completed;
        address creator;
    }

    uint256 public taskCount;
    mapping(uint256 => Task) public tasks;

    event TaskCreated(uint256 indexed id, string content, address indexed creator);
    event TaskToggled(uint256 indexed id, bool completed);

    function createTask(string memory _content) public {
        require(bytes(_content).length > 0, "Task content cannot be empty");
        taskCount++;
        tasks[taskCount] = Task(taskCount, _content, false, msg.sender);
        emit TaskCreated(taskCount, _content, msg.sender);
    }

    function toggleTask(uint256 _taskId) public {
        require(_taskId > 0 && _taskId <= taskCount, "Invalid task ID");
        Task storage task = tasks[_taskId];
        require(task.creator == msg.sender, "Only the task creator can toggle it");
        task.completed = !task.completed;
        emit TaskToggled(_taskId, task.completed);
    }

    function getTask(uint256 _taskId) public view returns (
        uint256 id,
        string memory content,
        bool completed,
        address creator
    ) {
        require(_taskId > 0 && _taskId <= taskCount, "Invalid task ID");
        Task memory t = tasks[_taskId];
        return (t.id, t.content, t.completed, t.creator);
    }
}
