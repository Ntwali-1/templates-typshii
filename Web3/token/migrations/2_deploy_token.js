const SimpleToken = artifacts.require("SimpleToken");

module.exports = function (deployer) {
  // Deploy with 1,000,000 initial tokens (internal units = 1,000,000 × 10^18)
  deployer.deploy(SimpleToken, 1000000);
};
