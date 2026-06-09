// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    // Token metadata (wallets and explorers read these)
    string public name = "MyToken";
    string public symbol = "MTK";
    uint8 public decimals = 18;

    // Tracks how many tokens each address has
    mapping(address => uint256) public balances;

    // allowance[owner][spender] = how many of owner's tokens the spender may move
    mapping(address => mapping(address => uint256)) public allowance;

    // Total supply of tokens
    uint256 public totalSupply;

    // Contract owner (like admin)
    address public owner;

    // Events (like logging for tests)
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed tokenOwner, address indexed spender, uint256 amount);

    // Constructor runs once when contract is deployed
    constructor(uint256 initialSupply) {
        owner = msg.sender;
        totalSupply = initialSupply;
        balances[msg.sender] = totalSupply;
    }

    // Only owner can call this
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Transfer tokens to someone else
    function transfer(address to, uint256 amount) public returns (bool) {
        // Tokens sent to the zero address would be lost forever
        require(to != address(0), "Cannot transfer to zero address");
        // Check sender has enough tokens
        require(balances[msg.sender] >= amount, "Insufficient balance");
        // Subtract from sender
        balances[msg.sender] -= amount;
        // Add to recipient
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    // Authorize a spender to move up to `amount` of my tokens
    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    // Move tokens on behalf of `from`, using a previously granted allowance.
    // This is how DeFi protocols pull deposits from users.
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(to != address(0), "Cannot transfer to zero address");
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        require(balances[from] >= amount, "Insufficient balance");
        allowance[from][msg.sender] -= amount;
        balances[from] -= amount;
        balances[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    // Check balance of any address (view function = does not cost gas)
    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    // Mint new tokens (only owner can do this)
    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        totalSupply += amount;
        balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    // Burn your own tokens (anyone can destroy tokens they hold)
    function burn(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
}
