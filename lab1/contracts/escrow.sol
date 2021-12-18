//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract EscrowService is AccessControl { //Ownable,

    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");

    bytes32 public constant SENDER_ROLE = keccak256("SENDER_ROLE");

    bytes32 public constant RECEIVER_ROLE  = keccak256("RECEIVER_ROLE");

 

    address public vault;

    address payable public agent;

    address payable public sender;

    address payable public receiver;

   

    uint256 public price;

    uint256 public fee;

    uint32 public status;

    uint256 public lockTime;

    uint private start;  

    constructor(address payable _sender_address, address payable _receiver_address, uint32 _price, uint256 _lockTime) {

        status = 0 ;

        vault = address(this);

        agent = payable(msg.sender);

        sender = _sender_address;

        lockTime = _lockTime; // in seconds

        receiver= _receiver_address;

        price = _price;

        fee = 1;

        start = block.timestamp;      

        _setupRole(AGENT_ROLE, agent);

        _setupRole(SENDER_ROLE, sender);

        _setupRole(RECEIVER_ROLE, receiver);
    }
    function SendPayment() external payable onlyRole(SENDER_ROLE) {

        require (msg.value > fee, "Escrow Agent fee of 1 Ether must be covered!");

        require (msg.value >= price, "Sender should pay at least the minimal price for the products or services.");

        require (status == 0 , "This should be the first stage of the negociation!");

        payable(agent).transfer(fee);

        uint256 new_price = price - fee;

        payable(vault).transfer(new_price);

        status = 1 ; // payment submitted to vault

    }
    receive() external payable {

    }
    function ClaimPayment () public onlyRole(RECEIVER_ROLE) {

        // seller should be able to claim payment only within the timelock period.

        require((block.timestamp < start + lockTime ), "You cannot claim the funds after the timelock period");

        require (status == 1 , "Cannot claim Payment without submission!");

        status = 2 ;  // seller has claimed the payment

    }
    function ConfirmDeliver () payable public onlyRole(SENDER_ROLE) {

        require (status == 2 , "Can only confirm delivery after seller has claimed for payment");

        status = 5 ; // sender confirmed the delivery

    }
    function DenyDeliver () public onlyRole(SENDER_ROLE) {

        require (status == 2 , "Can only deny delivery after seller has claimed for payment");

        require((block.timestamp > start + lockTime), "You cannot deny delivery before the timelock period");

        status = 4 ;
        
            }
    function AgentTransfer () onlyRole(AGENT_ROLE) public {

        if(status == 5 ){
            receiver.transfer(vault.balance);
        }
        else if(status == 4 ){
            sender.transfer(vault.balance);

        }

    }

 

}