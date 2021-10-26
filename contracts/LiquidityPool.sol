pragma solidity ^0.8.0;

import "./FirstToken.sol";
import "hardhat/console.sol";

contract LiquidityPool {

	uint256 public ethPool;
	uint256 public tokenPool;
	uint256 private ethFeesAccumulated;
	uint256 private tokenFeesAccumulated;
	uint256 public feePercent;
	address public token;
	address public owner;

	// Events

	/** @dev To be raised when owner provides liquidity.
     *  @param provider The address of the owner of the contract who provided liquidity
     *  @param ethAmount Amount of ETH provided
     *  @param tokenProvided Smart Contract address of the token provided
     *  @param tokenAmount Amount of the token provided
     */
	event AddLiquidity(address provider, uint256 ethAmount, address tokenProvided, uint256 tokenAmount, uint256 newEthPool, uint256 newTokenPool);

	/** @dev To be raised when an exchange is made.
     *  @param exchanger The address making an exchange
     *  @param tokenGet The token that the pool is receiving
     *  @param amountGet Amount of the token the pool is receiving
     *  @param tokenGive The token that the pool is given
     *  @param amountGive Amount of the token the pool is giving
     *  @param feesPayed Amount of fees payed
     */
	event Exchange(address exchanger, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 feesPayed, uint256 newEthPool, uint256 newTokenPool);

	constructor(uint256 _feePercent, address _token, address _owner) public {
		owner = payable(_owner);
		ethPool = 0;
		tokenPool = 0;
		ethFeesAccumulated = 0;
		tokenFeesAccumulated = 0;
		feePercent = _feePercent;
		token = _token;
	}

	/** @dev Called by owner to provide liquidity. Does not enforce provision ratio
     *  @param tokenProvided Smart Contract address of the token provided
     *  @param tokenAmount Amount of the token provided
     */
	function addLiquidity(address tokenProvided, uint256 tokenAmount) external payable {
		require(msg.sender == owner, "Caller must own the contract to be a liquidity provider");
		require(tokenProvided == token, "This token cannot be provided in this pool");
		require(!(msg.value == 0 || tokenAmount == 0), "Must provide both ETH and Token");
		require(FirstToken(tokenProvided).transferFrom(msg.sender, address(this), tokenAmount));
		ethPool = ethPool + msg.value;
		tokenPool = tokenPool + tokenAmount;

		emit AddLiquidity(msg.sender, msg.value, token, tokenAmount, ethPool, tokenPool);
	}

	/** @dev Exchanges ETH to token
     */
	function ethToToken() external payable {
		uint256 feePayed = (msg.value * feePercent) / 100;
		uint256 invariant = ethPool * tokenPool;
		uint256 newEthPool = ethPool + msg.value;
		uint256 newTokenPool = invariant / (newEthPool - feePayed);
		uint256 tokenAmountGive = tokenPool - newTokenPool;
		require(tokenPool >= tokenAmountGive, "Not enough tokens in the pool");
		require(FirstToken(token).transfer(msg.sender, tokenAmountGive));
		ethPool = newEthPool;
		tokenPool = newTokenPool;
		ethFeesAccumulated = ethFeesAccumulated + feePayed;

		emit Exchange(msg.sender, address(0), msg.value, token, tokenAmountGive, feePayed, ethPool, tokenPool);
	}

	/** @dev Exchanges tokens to ETH
     *  @param tokenAmount Amount of the token provided
     */
	function tokenToEth(uint256 tokenAmount) external {
		uint256 feePayed = (tokenAmount * feePercent) / 100;
		uint256 invariant = ethPool * tokenPool;
		uint256 newTokenPool = tokenPool + tokenAmount;
		uint256 newEthPool = invariant / (newTokenPool - feePayed);
		uint256 ethAmountGive = ethPool - newEthPool;
		require(ethPool >= ethAmountGive, "Not enough Eth in the pool");
		require(FirstToken(token).transferFrom(msg.sender, address(this), tokenAmount));
		payable(msg.sender).transfer(ethAmountGive);
		ethPool = newEthPool;
		tokenPool = newTokenPool;
		tokenFeesAccumulated = tokenFeesAccumulated + feePayed;

		emit Exchange(msg.sender, token, tokenAmount, address(0), ethAmountGive, feePayed, ethPool, tokenPool);
	}

	/** @dev Called by owner to withdraw ETH fees accumulated
     *  @param ethAmount Amount of eth fees accumulated to be withdrawn by owner
     */
	function withdrawEthFees(uint256 ethAmount) external {
		require(msg.sender == owner, "Caller must own the contract to withdraw fees");
		require(ethFeesAccumulated >= ethAmount, "Withdraw request is greater than ETH fees accumulated");
		payable(msg.sender).transfer(ethAmount);
		ethPool = ethPool - ethAmount;
		ethFeesAccumulated = ethFeesAccumulated - ethAmount;
	}

	/** @dev Called by owner to withdraw token fees accumulated
     *  @param tokenAmount Amount of token fees accumulated to be withdrawn by owner
     */
	function withdrawTokenFees(uint256 tokenAmount) external {
		require(msg.sender == owner, "Caller must own the contract to withdraw fees");
		require(tokenFeesAccumulated >= tokenAmount, "Withdraw request is greater than token fees accumulated");
		tokenPool = tokenPool - tokenAmount;
		tokenFeesAccumulated = tokenFeesAccumulated - tokenAmount;
	}

	function getEthFeesAcumulated() public view returns (uint256) {
	 	require(msg.sender == owner, "Caller must own the contract to view fees accumulated");
    	return ethFeesAccumulated;
  	}

	function getTokenFeesAcumulated() public view returns (uint256) {
	 	require(msg.sender == owner, "Caller must own the contract to view fees accumulated");
    	return tokenFeesAccumulated;
  	}

}