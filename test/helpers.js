const ethers = require('ethers');
 
const tokens = (n) => {
	return ethers.utils.parseEther(n.toString());
}

const toBigNumber = (n) => {
	return ethers.BigNumber.from(n.toString());
}

const toEther = (n) => {
	return ethers.utils.formatEther(toBigNumber(n));
}

const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

module.exports = {
	tokens,
	toBigNumber,
	toEther,
	ETHER_ADDRESS
}