// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Staker {

    mapping(address => uint256) public balances;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);

    // Stake ETH
    function stake() external payable {
        require(msg.value > 0, "Must send ETH");

        balances[msg.sender] += msg.value;

        emit Staked(msg.sender, msg.value);
    }

    // Unstake ETH anytime
    function unstake(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Not enough balance");

        balances[msg.sender] -= amount;

        payable(msg.sender).transfer(amount);

        emit Unstaked(msg.sender, amount);
    }

    // View contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}