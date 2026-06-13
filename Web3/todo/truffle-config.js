module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,        // Ganache GUI default — change to 8545 for ganache-cli
      network_id: "*"
    }
  },
  mocha: {},
  compilers: {
    solc: {
      version: "0.8.0"
    }
  }
};
