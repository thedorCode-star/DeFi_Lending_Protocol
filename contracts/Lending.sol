// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lending {
    mapping(address => uint256) public collateral;  // User -> collateral amount
    mapping(address => uint256) public borrowAmount; // User -> borrowed amount
    
    address public owner;
    uint256 public interestRate = 10; // 10% interest
    
    event Deposited(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    // Deposit ETH as collateral
    function deposit() public payable {
        require(msg.value > 0, "Must deposit something");
        collateral[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }
    
    // Borrow tokens (can borrow up to 50% of collateral)
    function borrow(uint256 amount) public {
        uint256 maxBorrow = collateral[msg.sender] / 2;
        require(amount <= maxBorrow, "Cannot borrow more than 50% of collateral");
        
        borrowAmount[msg.sender] += amount;
        // In real DeFi, you'd send actual tokens
        emit Borrowed(msg.sender, amount);
    }
    
    // Repay borrowed amount
    function repay(uint256 amount) public payable {
        require(amount <= borrowAmount[msg.sender], "Repaying more than owed");
        require(msg.value >= amount, "Need to send enough ETH");
        
        borrowAmount[msg.sender] -= amount;
        emit Repaid(msg.sender, amount);
    }
    
    // Withdraw collateral (must repay all borrows first)
    function withdraw(uint256 amount) public {
        require(amount <= collateral[msg.sender], "Not enough collateral");
        require(borrowAmount[msg.sender] == 0, "Must repay all borrows first");
        
        collateral[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }
    
    // Get user's health factor (higher is better)
    function getHealthFactor(address user) public view returns (uint256) {
        if (borrowAmount[user] == 0) return type(uint256).max;
        return (collateral[user] * 100) / (borrowAmount[user] * 2);
    }
}