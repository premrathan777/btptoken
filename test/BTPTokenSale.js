const BTPToken = artifacts.require("BTPToken")
const BTPTokenSale = artifacts.require("BTPTokenSale")

contract('BTPTokenSale', (accounts) => {

    let token, tokenSale;
    let tokenPrice = 1000000000000000;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokensAvailable = 750000;
    var numberOfTokens = 10;



    before(async () => {
        token = await BTPToken.deployed();
        tokenSale = await BTPTokenSale.deployed();
      });


    describe("Initialize contract with correct values", () => {
         it("Check initializations", async () => {
            const address = await tokenSale.address;
            assert.notEqual(address, 0x0, "Has contract address");
            const tokenContractAddress = tokenSale.tokenContract();
			assert.notEqual(tokenContractAddress, 0x0, "Has a token contact address, address");
            const price = await tokenSale.tokenPrice(); 
            assert.equal(price, tokenPrice, "token price in wei");
        });


    });


    describe("buyTokens", () => {

      it("Facilitates token buying", async() => {  
      //token.transfer(tokenSale.address, tokensAvailable, {from : admin});
      numberOfTokens = 10;
      const receipt = await tokenSale.buyTokens(numberOfTokens, { from : buyer, value : numberOfTokens * tokenPrice});
      tokensSold = await tokenSale.tokensSold();
      assert.equal(tokensSold, numberOfTokens, "No. of tokens sold");
      assert.equal(receipt.logs.length, 1, "Triggers one event");
      assert.equal(receipt.logs[0].event, "Sell", "Triggers Sell event");
      assert.equal(receipt.logs[0].args._buyer, buyer, "Logs the address which purchased the tokens");
      assert.equal(receipt.logs[0].args._amount, numberOfTokens, "Logs the number of tokens purchased");
      });
     
      //Try to buy tokens different form the ether values
     it("Try to buy tokens different from the ether values", async() => { 
        try
        {
            await tokenSale.buyTokens(numberOfTokens, { from : buyer, value : 1});
            assert.fail("Assert should fail as number of tokens does not equal value");
        }
        catch(error)
        {
        assert(error.message.indexOf("revert") >= 0, "Revert must be present"); 
        }

    });  
     
    it("Try to buy tokens more than what contract has", async() => {
        try 
        {
            await tokenSale.buyTokens(800000, { from: buyer, value : numberOfTokens * tokenPrice });
            assert.fail("Assert should fail as contact does not have this much tokens");
        } 
        catch (error) 
        {
            assert(error.message.indexOf("revert") >= 0, "Revert must be present");
        }
    });
      
    

      it("Check updated balance of buyer and contract", async() => {
        var contractTokenBalance = await token.balanceOf(tokenSale.address);
        var buyerTokenBalance = await token.balanceOf(buyer);

        assert.equal(contractTokenBalance.toNumber(), tokensAvailable - numberOfTokens);
        assert.equal(buyerTokenBalance.toNumber(), numberOfTokens);
     
      });
      
        
});   

describe("End Crowd Sale function", () => {
   it("Can only be called by admin", async() => {
      try
      {  
            await tokenSale.endSale({ from: accounts[3] });
            assert.fail("Should fail because only admin can end sale");
      } 
        
      catch (error) 
      {
            assert(error.message.indexOf("revert") >= 0, "Error message must contain revert");
      }
      
    });


    it("Transfer tokens back to admin", async () => {
        await tokenSale.endSale({ from : admin });
        const adminTokenBalance = await token.balanceOf(admin);
        const contractTokenBalance = await token.balanceOf(tokenSale.address);
        assert.equal(adminTokenBalance.toNumber(), 1000000 - 10, "Contract balance should go to admin");
        assert.equal(contractTokenBalance.toNumber(), 0, "Contract balance should go to admin")
        
    });

    it("Self destruct", async() => {
        var adminAddress = await tokenSale.admin;
        assert.equal(adminAddress, undefined, "Admin is undefined");
    });

    

});

});