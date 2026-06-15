// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Calculator {
    int256 public lastResult;

    event Calculated(string operation, int256 a, int256 b, int256 result);

    function add(int256 a, int256 b) public returns (int256) {
        lastResult = a + b;
        emit Calculated("add", a, b, lastResult);
        return lastResult;
    }

    function subtract(int256 a, int256 b) public returns (int256) {
        lastResult = a - b;
        emit Calculated("subtract", a, b, lastResult);
        return lastResult;
    }

    function multiply(int256 a, int256 b) public returns (int256) {
        lastResult = a * b;
        emit Calculated("multiply", a, b, lastResult);
        return lastResult;
    }

    function divide(int256 a, int256 b) public returns (int256) {
        require(b != 0, "Division by zero is not allowed");
        lastResult = a / b;
        emit Calculated("divide", a, b, lastResult);
        return lastResult;
    }
}
