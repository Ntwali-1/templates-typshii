// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Auction {
    address public owner;
    string public itemName;
    uint256 public auctionEndTime;
    address public highestBidder;
    uint256 public highestBid;
    bool public ended;

    // Tracks ETH owed back to outbid bidders (withdrawal pattern)
    mapping(address => uint256) public pendingReturns;

    event BidPlaced(address indexed bidder, uint256 amount);
    event AuctionEnded(address indexed winner, uint256 amount);

    constructor(string memory _itemName, uint256 durationSeconds) {
        owner = msg.sender;
        itemName = _itemName;
        auctionEndTime = block.timestamp + durationSeconds;
    }

    function bid() public payable {
        require(block.timestamp < auctionEndTime, "Auction has already ended");
        require(!ended, "Auction was closed early");
        require(msg.value > highestBid, "Bid must exceed the current highest bid");

        if (highestBid > 0) {
            pendingReturns[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
        emit BidPlaced(msg.sender, msg.value);
    }

    function withdraw() public returns (bool) {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "No funds available to withdraw");
        // Zero out before transfer to prevent re-entrancy
        pendingReturns[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        return true;
    }

    function endAuction() public {
        require(msg.sender == owner, "Only the owner can end the auction");
        require(block.timestamp >= auctionEndTime, "Auction period not yet over");
        require(!ended, "Auction has already been ended");
        ended = true;
        if (highestBidder != address(0)) {
            payable(owner).transfer(highestBid);
        }
        emit AuctionEnded(highestBidder, highestBid);
    }

    function timeRemaining() public view returns (uint256) {
        if (block.timestamp >= auctionEndTime) return 0;
        return auctionEndTime - block.timestamp;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
