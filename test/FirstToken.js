const { tokens, ETHER_ADDRESS } = require('./helpers.js');
const { expect } = require('chai').use(require("chai-as-promised"));


describe("FirstToken", () => {

  	let FirstToken;
  	let owner;
  	let addr1;
  	let addr2;

  	beforeEach(async () => {
  		FirstToken = await ethers.getContractFactory("FirstToken");
  		FirstToken = await FirstToken.deploy();
  		console.log(FirstToken);
  		[owner, addr1, addr2] = await ethers.getSigners();
  	});

  	describe("Deployment", () => {
  		const name = 'First Token'
  		const symbol = 'FIRST'
  		const decimals = '18'
  		const totalSupply = 1000000

  		it("Should set the correct token name", async function () {
  			const result = await FirstToken.name();
      		expect(result).to.equal(name);
    	});

    	it("Should set the correct token symbol", async function () {
    		const result = await FirstToken.symbol();
      		expect(result).to.equal(symbol);
    	});

    	it("Should set the correct token decimals", async function () {
    		const result = await FirstToken.decimals();
      		expect(result.toString()).to.equal(decimals);
    	});

    	it("Should set the correct total supply", async function () {
    		const result = await FirstToken.totalSupply();
      		expect(result.toString()).to.equal(tokens(totalSupply).toString());
    	});

    	it("Should set the total supply to owner", async function () {
    		const result = await FirstToken.balanceOf(owner.address);
      		expect(result.toString()).to.equal(tokens(totalSupply).toString());
    	});
  	});

  	describe("Transfer", () => {
  		
  		describe("Successful Transfer", () => {
  			beforeEach(async() => {
  				amount = tokens(100)
        		result = await FirstToken.transfer(addr1.address, amount);
  			});

  			it("Should successfully transfer token balances", async() => {
  				balanceOfAddr1 = await FirstToken.balanceOf(addr1.address);
  				balanceOfOwner = await FirstToken.balanceOf(owner.address);
  				expectedBalanceOfOwner = tokens(999900);
  				expectedBalanceOfAddr1 = tokens(100);

  				expect(balanceOfOwner.toString()).to.equal(expectedBalanceOfOwner.toString());
  				expect(balanceOfAddr1.toString()).to.equal(expectedBalanceOfAddr1.toString());
  				await expect(FirstToken.transfer(addr1.address, 100))
  						.to.emit(FirstToken, 'Transfer')
  						.withArgs(owner.address, addr1.address, 100);
  			});
  		});

  		describe("Unsuccessful transfer", ()=> {

  			describe("Insufficient funds", () => {
  				const error = "VM Exception while processing transaction: revert ERC20: Sender balance is less than transfer amount";
  				
  				it("Rejects due to no funds", async() => {
  					const amount = tokens(1);
  					return expect(FirstToken.connect(addr1).transfer(owner.address, amount))
  							.to.eventually.be.rejectedWith(error);
  				});

  				it("Rejects due to attempted transfer over totalSupply", async() => {
  					const amount = tokens(10000000);
  					return expect(FirstToken.transfer(addr1.address, amount))
  							.to.eventually.be.rejectedWith(error);
  				});

  			})

  			it("rejects due to sending to 0 address", async() => {
  				const amount = tokens(1);
  				const error = "VM Exception while processing transaction: revert ERC20: Transfer to the 0 address";
  				return expect(FirstToken.transfer(ETHER_ADDRESS, amount))
  					.to.eventually.be.rejectedWith(error);
  			});

  			it("rejects due to sending from 0 address", async() => {
  				const amount = tokens(1);
  				return expect(FirstToken.connect(ETHER_ADDRESS).transfer(addr1.address, amount))
  					.to.eventually.be.rejected;
  			});
  		});
  	}); 
  
});
