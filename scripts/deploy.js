const { ethers } = require("ethers");
const hre = require("hardhat");
const web3 = require('web3');

async function main() {
    const tokens = (n) => {
	return web3.utils.toWei(n, 'ether');
}
    const FirstToken = await hre.ethers.getContractFactory("FirstToken");
    const firstToken = await FirstToken.deploy();
    await firstToken.deployed();
    
    console.log( "FirstToken deployed to: ", firstToken.address);
    const feePercent = 10;
    const tokenAddress = firstToken.address;
    [deployer] = await hre.ethers.getSigners();

    const LiquidityPool = await hre.ethers.getContractFactory("LiquidityPool");
    const liquidityPool = await LiquidityPool.deploy(feePercent, tokenAddress, deployer.address);
    await liquidityPool.deployed();
    console.log("LiquidityPool deployed to: ", liquidityPool.address);

    let tokensProvided = tokens('100000');
	let ethProvided = tokens('1.5');

    const transaction = await firstToken.connect(deployer).approve(liquidityPool.address, tokensProvided);
    await transaction.wait();
    console.log("ran")
    await liquidityPool.connect(deployer).addLiquidity(firstToken.address, tokensProvided, {from: deployer.address, value: ethProvided});
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1);
    });