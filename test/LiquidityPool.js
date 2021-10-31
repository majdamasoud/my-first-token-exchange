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
  				expect(args.newEthPool.toString()).to.equal(ethProvided.toString());
  				expect(args.newTokenPool.toString()).to.equal(tokensProvided.toString());
  			});

  		});
  	});

  	describe("Function: getEthFeesAccumulated", () => {

  		it("Should fail if not the owner calling", async () => {
  			const error = "VM Exception while processing transaction: revert Caller must own the contract to view fees accumulated";
  			return expect(LiquidityPool.connect(exchanger1)
  					.getEthFeesAcumulated())
  					.to.eventually.be.rejectedWith(error);
  		});
  	});

	describe("Function: getTokenFeesAccumulated", () => {

		it("Should fail if not the owner calling", async () => {
			const error = "VM Exception while processing transaction: revert Caller must own the contract to view fees accumulated";
			return expect(LiquidityPool.connect(exchanger1)
					.getTokenFeesAcumulated())
					.to.eventually.be.rejectedWith(error);
		});
	});

  	describe("Function: ethToToken", () => {
		let ownerTokenBalance = tokens(1000);
		let tokensProvided = tokens(900);
		let ethProvided = tokens(9);
		let ethTraded = tokens(10);
		let expectedFees = tokens(1);
		let expectedNewEthPool = tokens(19);
		let expectedNewTokenPool = tokens(450);
		let tokensReceived = tokens(450);
		
		
  		describe("Success", () => {

  			beforeEach(async () => {
  				await FirstToken.transfer(owner.address, ownerTokenBalance);
  				await FirstToken.connect(owner).approve(LiquidityPool.address, tokensProvided);
  				await LiquidityPool.connect(owner).addLiquidity(FirstToken.address, tokensProvided, {from: owner.address, value: ethProvided});
  				let tx = await LiquidityPool.connect(exchanger1).ethToToken({from: exchanger1.address, value: ethTraded});
  				result = await tx.wait();
  			});

  			it("Should update the ethPool, tokenPool, and feesAccumalted fields in contract", async () => {
  				let newEthPool = await LiquidityPool.ethPool();
  				let newTokenPool = await LiquidityPool.tokenPool();
  				let newFeesAccumulated = await LiquidityPool.connect(owner).getEthFeesAcumulated();

  				expect(newEthPool.toString()).to.equal(expectedNewEthPool.toString());
  				expect(newTokenPool.toString()).to.equal(expectedNewTokenPool.toString());
  				expect(newFeesAccumulated.toString()).to.equal(expectedFees.toString());
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
  				expect(args.feesPayed.toString()).to.equal(expectedFees.toString());
  				expect(args.newEthPool.toString()).to.equal(expectedNewEthPool.toString());
  				expect(args.newTokenPool.toString()).to.equal(expectedNewTokenPool.toString());
  			});

  		});
  	});

  	describe("Function: tokenToEth", () => {
		let ownerTokenBalance = tokens(1000);
		let tokensProvided = tokens(900);
		let ethProvided = tokens(9);
		let tokensTraded = tokens(1000);
		let expectedFees = tokens(100);
		let expectedNewEthPool = tokens(4.5);
		let expectedNewTokenPool = tokens(1900);
		let ethReceived = tokens(4.5);

  		describe("Success", () => {

  			beforeEach(async () => {
  				await FirstToken.transfer(owner.address, ownerTokenBalance);
  				await FirstToken.transfer(exchanger1.address, tokensTraded);
  				await FirstToken.connect(owner).approve(LiquidityPool.address, tokensProvided);
  				await FirstToken.connect(exchanger1).approve(LiquidityPool.address, tokensTraded);
  				await LiquidityPool.connect(owner).addLiquidity(FirstToken.address, tokensProvided, {from: owner.address, value: ethProvided});
  				let tx = await LiquidityPool.connect(exchanger1).tokenToEth(tokensTraded.toString());
  				result = await tx.wait();
  			});

  			it("Should update the ethPool, tokenPool, and feesAccumalted fields in contract", async () => {
  				let newEthPool = await LiquidityPool.ethPool();
  				let newTokenPool = await LiquidityPool.tokenPool();
  				let newFeesAccumulated = await LiquidityPool.connect(owner).getTokenFeesAcumulated();
				
  				expect(newEthPool.toString()).to.equal(expectedNewEthPool.toString());
  				expect(newTokenPool.toString()).to.equal(expectedNewTokenPool.toString());
  				expect(newFeesAccumulated.toString()).to.equal(expectedFees.toString());
  			});

  			it("Should emit Exchange event", async () => {
  				const event = result.events?.filter((x) => {return x.event == "Exchange"})[0];
  				expect(event.event).to.equal("Exchange");
  				const args = event.args;
  				expect(args.exchanger).to.equal(exchanger1.address);
  				expect(args.tokenGet).to.equal(FirstToken.address);
  				expect(args.amountGet.toString()).to.equal(tokensTraded.toString());
  				expect(args.tokenGive).to.equal(ETHER_ADDRESS);
  				expect(args.amountGive.toString()).to.equal(ethReceived.toString());
  				expect(args.feesPayed.toString()).to.equal(expectedFees.toString());
  				expect(args.newEthPool.toString()).to.equal(expectedNewEthPool.toString());
  				expect(args.newTokenPool.toString()).to.equal(expectedNewTokenPool.toString());
  			});

  		});
  	});

});