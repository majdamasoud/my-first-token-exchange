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

    const feePercent = 10;
    const tokenAddress = firstToken.address;
    [deployer, owner] = await hre.ethers.getSigners();

    const LiquidityPool = await hre.ethers.getContractFactory("LiquidityPool");
    const liquidityPool = await LiquidityPool.deploy(feePercent, tokenAddress, owner.address);
    await liquidityPool.deployed();

    const ownerTokenBalance  = tokens('200000');
    let tokensProvided = tokens('900');
	let ethProvided = tokens('9');

    await firstToken.transfer(owner.address, ownerTokenBalance);
    await firstToken.connect(owner).approve(liquidityPool.address, tokensProvided);
    await liquidityPool.connect(owner).addLiquidity(firstToken.address, tokensProvided, {from: owner.address, value: ethProvided});


    console.log("LiquidityPool deployed to: ", liquidityPool.address);
    console.log( "FirstToken deployed to: ", firstToken.address);
    console.log("LiquidityPool Owner: ", liquidityPool.owner());
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1);
    });