const Auction = artifacts.require("Auction");

module.exports = function (deployer) {
  // "Rare Digital Artwork" auction lasting 5 minutes (300 seconds) for local testing
  deployer.deploy(Auction, "Rare Digital Artwork", 300);
};
