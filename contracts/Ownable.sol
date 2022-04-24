pragma solidity ^0.8.11;

contract Ownable {

    address payable owner;

///modifier
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    //constructor
     constructor() {
        owner = payable(msg.sender);
    }
}