require("@nomiclabs/hardhat-waffle");
require("hardhat-tracer");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      accounts: {
        accountsBalance: "100000000000000000000",
      },
    },
  },
  solidity: "0.8.0",
};

