const { tokens, toBigNumber, toEther, ETHER_ADDRESS } = require('./helpers.js');
const { expect } = require('chai').use(require("chai-as-promised"));

describe("LiquidityPool", () => {
	let FirstToken;
	let LiquidityPool;
	let deployer;
  	let owner;
  	let exchanger1;
  	let feePercent;

  	beforeEach(async () => {
  		feePercent = 10;

  		// Inititalize ERC20 token instance for the pool
  		FirstToken = await ethers.getContractFactory("FirstToken");
  		FirstToken = await FirstToken.deploy();
  		await FirstToken.deployed();
  		// Initialize wallet addresses for test transactions
  	    [deployer, owner, exchanger1] = await ethers.getSigners();

  	    // Initialize LiquidityPool instance
  		LiquidityPool = await ethers.getContractFactory("LiquidityPool");
  		LiquidityPool = await LiquidityPool.deploy(feePercent, FirstToken.address, owner.address);
  	});

  	afterEach(async () => {
  		await network.provider.request({
  			method: "hardhat_reset",
  			params: [],
		});
  	});

  	describe("Deployment", () => {
  		
  		it("Should set the owner field to the owner address", async () => {
  			const result = await LiquidityPool.owner();
  			expect(result.toString()).to.equal(owner.address);
  		});

  		it("Should set the ethPool field to 0", async () => {
  			const result = await LiquidityPool.ethPool();
  			expect(result.toString()).to.equal("0");
  		});

  		it("Should set the tokenPool field to 0", async () => {
  			const result = await LiquidityPool.tokenPool();
  			expect(result.toString()).to.equal("0");
  		});

  		it("Should set the feePercent field to 3%", async () => {
  			const result = await LiquidityPool.feePercent();
  			expect(result.toString()).to.equal(feePercent.toString());
  		});
  	});

  	describe("Function: addLiquidity", () => {
  		const ethProvided = tokens(10);
  		const tokensProvided = tokens(100000)
  		let result;

  		describe("Failure", () => {

  			it("Should fail if caller is not owner", () => {
  				const error = "VM Exception while processing transaction: revert Caller must own the contract to be a liquidity provider"
  				return expect(LiquidityPool.connect(exchanger1)
  					.addLiquidity(FirstToken.address, tokensProvided, {from: exchanger1.address, value: ethProvided}))
  					.to.eventually.be.rejectedWith(error);
  			});

  			it("Should fail if incorrect token is provided", () => {
  				const error = "VM Exception while processing transaction: revert This token cannot be provided in this pool"
  				const SWAP = "0xcc4304a31d09258b0029ea7fe63d032f52e44efe"
  				return expect(LiquidityPool.connect(owner)
  					.addLiquidity(SWAP, tokensProvided, {from: owner.address, value: ethProvided}))
  					.to.eventually.be.rejectedWith(error);
  			});

  			it("Should fail if providing 0 tokens or eth", () => {
  				const error = "VM Exception while processing transaction: revert Must provide both ETH and Token"
  				return expect(LiquidityPool.connect(owner)
  					.addLiquidity(FirstToken.address, 0, {from: owner.address, value: ethProvided}))
  					.to.eventually.be.rejectedWith(error);
  			});
  		});

  		describe("Success", () => {
  			const ownerTokenBalance  = tokens(200000);

  			beforeEach(async () => {
  				await FirstToken.transfer(owner.address, ownerTokenBalance);
  				await FirstToken.connect(owner).approve(LiquidityPool.address, tokensProvided);
  				let tx = await LiquidityPool.connect(owner).addLiquidity(FirstToken.address, tokensProvided, {from: owner.address, value: ethProvided});
  				result = await tx.wait();
  			});

  			it("Should successfully add eth and tokens to the pool", async () => {
  				let ethPool = await LiquidityPool.ethPool();
  				let tokenPool = await LiquidityPool.tokenPool();
  				let exchangeTokenBalance = await FirstToken.balanceOf(LiquidityPool.address);
  				let ownerTokenBalance = await FirstToken.balanceOf(owner.address);
  				let ownerExpectedBalance = tokens(100000);

  				expect(ethPool.toString()).to.equal(ethProvided.toString());
  				expect(tokenPool.toString()).to.equal(tokensProvided.toString());
  				expect(exchangeTokenBalance.toString()).to.equal(tokensProvided.toString());
  				expect(ownerTokenBalance.toString()).to.equal(ownerExpectedBalance.toString());

  			});

  			it("Should successfully emit an AddLiquidity event", async () => {
  				const event = result.events?.filter((x) => {return x.event == "AddLiquidity"})[0];
  				expect(event.event).to.equal("AddLiquidity");
  				const args = event.args;
  				expect(args.provider).to.equal(owner.address);
  				expect(args.ethAmount.toString()).to.equal(ethProvided.toString());
  				expect(args.tokenProvided).to.equal(FirstToken.address);
  				expect(args.tokenAmount.toString()).to.equal(tokensProvided.toString());
  			});

  		});
  	});

  	describe("Function: getFeesAccumulated", () => {

  		it("Should fail if not the owner calling", async () => {
  			const error = "VM Exception while processing transaction: revert Caller must own the contract to view fees accumulated";
  			return expect(LiquidityPool.connect(exchanger1)
  					.getFeesAcumulated())
  					.to.eventually.be.rejectedWith(error);
  		});
  	});

  	describe("Function: ethToToken", () => {
  		const ethProvided = toBigNumber(tokens(10));
  		const tokensProvided = toBigNumber(tokens(1000));
  		const ethTraded = toBigNumber(tokens(1));
  		const invariant = ethProvided.mul(tokensProvided);
  		const ownerTokenBalance  = toBigNumber(tokens(2000));

  		const expectedNewEthPool = toBigNumber(tokens(11));
  		const expectedNewFeesAccumulated = toBigNumber(tokens(0.1));
  		const expectedNewTokenPool = invariant.div(expectedNewEthPool);

  		const tokensReceived = tokensProvided.sub(expectedNewTokenPool);

  		let result;

  		describe("Success", () => {

  			beforeEach(async () => {
  				await FirstToken.transfer(owner.address, ownerTokenBalance.toString());
  				await FirstToken.connect(owner).approve(LiquidityPool.address, tokensProvided.toString());
  				await LiquidityPool.connect(owner).addLiquidity(FirstToken.address, tokensProvided.toString(), {from: owner.address, value: ethProvided.toString()});
  				let tx = await LiquidityPool.connect(exchanger1).ethToToken({from: exchanger1.address, value: ethTraded.toString()});
  				result = await tx.wait();
  			});

  			it("Should update the ethPool, tokenPool, and feesAccumalted fields in contract", async () => {
  				let newEthPool = await LiquidityPool.ethPool();
  				let newTokenPool = await LiquidityPool.tokenPool();
  				let newFeesAccumulated = await LiquidityPool.connect(owner).getFeesAcumulated();

  				expect(newEthPool.toString()).to.equal(expectedNewEthPool.toString());
  				expect(newTokenPool.toString()).to.equal(expectedNewTokenPool.toString());
  				expect(newFeesAccumulated.toString()).to.equal(expectedNewFeesAccumulated.toString());
  			});

  			it("Should emit Exchange event", async () => {
  				const event = result.events?.filter((x) => {return x.event == "Exchange"})[0];
  				expect(event.event).to.equal("Exchange");
  				const args = event.args;
  				expect(args.exchanger).to.equal(exchanger1.address);
  				expect(args.tokenGet).to.equal(ETHER_ADDRESS);
  				expect(args.amountGet.toString()).to.equal(ethTraded.toString());
  				expect(args.tokenGive).to.equal(FirstToken.address);
  				expect(args.amountGive.toString()).to.equal(tokensReceived.toString());
  				expect(args.feesPayed.toString()).to.equal(expectedNewFeesAccumulated.toString());
  			});

  		});

  		// describe("Failure", () => {

  		// 	it("Should fail if trying to exchange for more tokens than in the pool", async () => {
  		// 		await FirstToken.transfer(owner.address, ownerTokenBalance);
  		// 		await FirstToken.connect(owner).approve(LiquidityPool.address, tokensProvided);
  		// 		await LiquidityPool.connect(owner).addLiquidity(FirstToken.address, tokensProvided, {from: owner.address, value: ethProvided});
  		// 		let ethTraded = tokens(90);
  		// 		const error = "VM Exception while processing transaction: revert Not enough tokens in the pool";
  		// 		return expect(LiquidityPool.connect(exchanger1)
  		// 			.ethToToken({from: exchanger1.address, value: ethTraded}))
  		// 			.to.eventually.be.rejectedWith(error);
  		// 	});

  		// });
  	});

  	describe("Function: tokenToEth", () => {
  		const ethProvided = toBigNumber(tokens(10));
  		const tokensProvided = toBigNumber(tokens(1000));
  		const ownerTokenBalance  = toBigNumber(tokens(2000));
  		const exchanger1TokenBalance = toBigNumber(tokens(250));
  		const expectedNewTokenPool = tokensProvided.add(exchanger1TokenBalance);
  		// (ethPool * tokenPool) / expectedNewTokenPool
  		const expectedNewEthPool = toBigNumber(tokens(8));
  		
  		let ethToSend = ethProvided.sub(expectedNewEthPool);

  		// multiple by fee percent
  		const expectedNewFeesAccumulated = ethToSend.mul(toBigNumber(10)).div(toBigNumber(100));
  		ethToSend = ethToSend.sub(expectedNewFeesAccumulated);

  		describe("Success", () => {

  			beforeEach(async () => {
  				await FirstToken.transfer(owner.address, ownerTokenBalance.toString());
  				await FirstToken.transfer(exchanger1.address, exchanger1TokenBalance.toString());
  				await FirstToken.connect(owner).approve(LiquidityPool.address, tokensProvided.toString());
  				await FirstToken.connect(exchanger1).approve(LiquidityPool.address, exchanger1TokenBalance.toString());
  				await LiquidityPool.connect(owner).addLiquidity(FirstToken.address, tokensProvided.toString(), {from: owner.address, value: ethProvided.toString()});
  				let tx = await LiquidityPool.connect(exchanger1).tokenToEth(exchanger1TokenBalance.toString());
  				result = await tx.wait();
  			});

  			it("Should update the ethPool, tokenPool, and feesAccumalted fields in contract", async () => {
  				let newEthPool = await LiquidityPool.ethPool();
  				let newTokenPool = await LiquidityPool.tokenPool();
  				let newFeesAccumulated = await LiquidityPool.connect(owner).getFeesAcumulated();
  				expect(newEthPool.toString()).to.equal(expectedNewEthPool.toString());
  				expect(newTokenPool.toString()).to.equal(expectedNewTokenPool.toString());
  				expect(newFeesAccumulated.toString()).to.equal(expectedNewFeesAccumulated.toString());
  			});

  			it("Should emit Exchange event", async () => {
  				const event = result.events?.filter((x) => {return x.event == "Exchange"})[0];
  				expect(event.event).to.equal("Exchange");
  				const args = event.args;
  				expect(args.exchanger).to.equal(exchanger1.address);
  				expect(args.tokenGet).to.equal(FirstToken.address);
  				expect(args.amountGet.toString()).to.equal(exchanger1TokenBalance.toString());
  				expect(args.tokenGive).to.equal(ETHER_ADDRESS);
  				expect(args.amountGive.toString()).to.equal(ethToSend.toString());
  				expect(args.feesPayed.toString()).to.equal(expectedNewFeesAccumulated.toString());
  			});

  		});
  	});

  	describe("Function: withdrawFees", () => {
  		const ethProvided = toBigNumber(tokens(10));
  		const tokensProvided = toBigNumber(tokens(1000));
  		const ownerTokenBalance  = toBigNumber(tokens(2000));
  		const exchanger1TokenBalance = toBigNumber(tokens(250));

  		beforeEach(async () => {
  				await FirstToken.transfer(owner.address, ownerTokenBalance.toString());
  				await FirstToken.transfer(exchanger1.address, exchanger1TokenBalance.toString());
  				await FirstToken.connect(owner).approve(LiquidityPool.address, tokensProvided.toString());
  				await FirstToken.connect(exchanger1).approve(LiquidityPool.address, exchanger1TokenBalance.toString());
  				await LiquidityPool.connect(owner).addLiquidity(FirstToken.address, tokensProvided.toString(), {from: owner.address, value: ethProvided.toString()});
  				await LiquidityPool.connect(exchanger1).tokenToEth(exchanger1TokenBalance.toString());
  			});

  		describe("Failure", () => {

  			const feesToWithdraw = toBigNumber(tokens(2)).mul(toBigNumber(11)).div(toBigNumber(100));

  			it("Should fail if caller is not owner", async () => {
  				const error = "VM Exception while processing transaction: revert Caller must own the contract to withdraw fees";
  				return expect(LiquidityPool.connect(exchanger1)
  					.withdrawFees(feesToWithdraw.toString()))
  					.to.eventually.be.rejectedWith(error);
  			});

  			it("Should fail if amount requested is less than fees accumulated", async () => {
  				const error = "VM Exception while processing transaction: revert Withdraw request is greater than fees accumulated";
  				return expect(LiquidityPool.connect(owner)
  					.withdrawFees(feesToWithdraw.toString()))
  					.to.eventually.be.rejectedWith(error);
  			});
  		})

  		describe("Success", () => {
  			const feesToWithdraw = toBigNumber(tokens(2)).mul(toBigNumber(10)).div(toBigNumber(100));

  			it("Should successfully withdraw fees by owner", async () => {
  				await LiquidityPool.connect(owner).withdrawFees(feesToWithdraw.toString());
  				const expectedNewFeesAccumulated = tokens(0);
  				const expectedNewEthPool = tokens(7.8);
  				const newFeesAccumulated = await LiquidityPool.connect(owner).getFeesAcumulated();
  				const newEthPool = await LiquidityPool.ethPool();
  				expect(newFeesAccumulated.toString()).to.equal(expectedNewFeesAccumulated.toString());
  				expect(newEthPool.toString()).to.equal(expectedNewEthPool.toString());
  			});

  		});
  	});


});