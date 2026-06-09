// This says who owns the code (MIT is open source)
// SPDX-License-Identifier: MIT

// This says which Solidity version to use
pragma solidity ^0.8.0;

// This is like a "class" in C#
contract Calculator {
    // This is like a variable that stores a number
    uint256 public result;

    // This function adds two numbers
    function add(uint256 a, uint256 b) public {
        result = a + b;
    }

    // This function subtracts two numbers
    function subtract(uint256 a, uint256 b) public {
        result = a - b;
    }

    // This function multiplies two numbers
    function multiply(uint256 a, uint256 b) public {
        result = a * b;
    }

    // This function divide two numbers
    function divide(uint256 a, uint256 b) public {
        require(b != 0, "Cannot divide by zero");
        result = a / b;
    }

    // This function squares a number (a × a)
    function square(uint256 a) public {
        result = a * a;
    }

    // Raises a to the power of b (a^b)
    function power(uint256 a, uint256 b) public {
        result = 1;
        for (uint256 i = 0; i < b; i++) {
            result = result * a;
        }
    }

    // This returns the current result
    function getResult() public view returns (uint256) {
        return result;
    }
}