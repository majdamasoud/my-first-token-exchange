const web3 = require('web3');
 
const tokens = (n) => {
	return web3.utils.toWei(n.toString(), 'ether');
}

const toBigNumber = (n) => {
	return web3.utils.toBN(n.toString());
}

const toEther = (n) => {
	return web3.utils.fromWei(n.toString());
}

const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

module.exports = {
	tokens,
	toBigNumber,
	toEther,
	ETHER_ADDRESS
}