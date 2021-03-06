// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract Greetings {
  string message;

  constructor() {
    message ="I'm ready";
  }

  function setGreetings (string memory _message) public {
    message = _message;
  }

  function getGreetings() public view returns (string memory) {
    return message;
  }
}