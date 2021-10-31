require("@nomiclabs/hardhat-waffle");
require("hardhat-tracer");
require('dotenv').config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  paths: {
    artifacts: './src/artifacts'
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/8d975d744e094a08a20b7b81b0a98003",
      accounts: [`0x${process.env.ACCOUNT_KEY}`]
    }

  },
  solidity: "0.8.0",
};

