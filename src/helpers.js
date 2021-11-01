const ethers = require('ethers');
 
const tokens = (n) => {
	return ethers.utils.parseEther(n);
}

const toBigNumber = (n) => {
	return ethers.BigNumber.from(n.toString());
}

const toEther = (n) => {
	return ethers.utils.formatEther(toBigNumber(n));
}

const nineHundredBN = toBigNumber(900);
const thousandBN = toBigNumber(1000);

// parameters are BN object, returning string in ethers
const getOutputString = (input, inputReserve, outputReserve) => {
	const numerator = input * outputReserve * nineHundredBN;
	const denominator = (inputReserve * thousandBN) + (input * nineHundredBN);
	return denominator ? numerator / denominator : '';
}

const getInputString = (output, inputReserve, outputReserve) => {
	const numerator = output * inputReserve * thousandBN;
	const denominator = (outputReserve - output) * nineHundredBN;
	return (denominator >= 0 && numerator >= 0)? (numerator / denominator): '';
}

const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

module.exports = {
	tokens,
	toBigNumber,
	toEther,
	ETHER_ADDRESS,
	getOutputString,
	getInputString
}