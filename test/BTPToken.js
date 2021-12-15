const BTPToken = artifacts.require("BTPToken")

contract('BTPToken', (accounts) => {
    let token;

    beforeEach(async () => {
        token = await BTPToken.deployed();
      });

    describe("Token Deployment", () => {
        
    it("Check the total supply upon deployment", async () => {
        const totalSupply = await token.totalSupply();
        assert.equal(totalSupply.toNumber(), 1000000);
    });

    it("Left over tokens in admin after transfering to tokensale at the time of deployment", async() => {
      const adminBalance = await token.balanceOf(accounts[0]);
      assert.equal(adminBalance.toNumber(), 250000);
    });

    it("Check the name", async() => {
      const name = await token.name()
      assert.equal(name, "BTPToken");
    });

    it("Check the symbol", async() => {
      const symbol = await token.symbol()
      assert.equal(symbol, "BTP");
    });

    it("Check the standard", async() => {
      const standard = await token.standard()
      assert.equal(standard, "BTPToken V1.0");
    });

   });


   describe("Transfer function", () => {
    it("More than owner's balance", async() => {
      try {
        await token.transfer.call(accounts[1], 99999999999999);
        assert.fail("Error should have occured!");
      } catch (error) {
        assert(error.message.indexOf("revert") >=0, "error message must contain revert");
      }

    });

    it("Successfull token transfer", async () => {
      let success = await token.transfer.call(accounts[1], 100000, { from: accounts[0] });
      assert.equal(success, true, "Event call should return true");
      let receipt = await token.transfer(accounts[1], 100000, { from: accounts[0] });
      assert.equal(receipt.logs.length, 1, "tiggers only one event");
      assert.equal(receipt.logs[0].event, "Transfer", "Should be 'Transfer' event");
      assert.equal(receipt.logs[0].args._from, accounts[0], "Should be sender ");
      assert.equal(receipt.logs[0].args._to, accounts[1], "Should be receiver");
      assert.equal(receipt.logs[0].args._value, 100000, "Amount transfered");

      var customerBalance = await token.balanceOf(accounts[1]);
      assert.equal(customerBalance, 100000, "Adds the amount to receiver account");
      var deployerBalance = await token.balanceOf(accounts[0]);
      assert.equal(deployerBalance, 150000, "Deducts the amount from the sender account");

   });


   });


describe("Approve function", () => {

 it("approves tokens for delegated transfer", async() => {
    var approveCall = await token.approve.call(accounts[1], 100);
    assert.equal(approveCall, true, "The call should return true");
    let allowanceAmount = await token.allowance(accounts[0], accounts[1]);
    assert.equal(allowanceAmount, 0, "Customer tokens allowance by owner must be 0");
    var approve = await token.approve(accounts[1], 100, { from: accounts[0] });
    allowanceAmount = await token.allowance(accounts[0], accounts[1]);
    assert.equal(allowanceAmount, 100, "Customer tokens allowance by owner must be 100");
    assert.equal(approve.logs.length, 1, "tiggers only one event");
    assert.equal(approve.logs[0].event, "Approval", "Should be 'Approval' event");
    assert.equal(approve.logs[0].args._owner, accounts[0], "Should be owner's account");
    assert.equal(approve.logs[0].args._spender, accounts[1], "Should be spender");
    assert.equal(approve.logs[0].args._value, 100, "Value approved");

 });

});


describe("transferFrom function", () =>{
  it("Handle delegate token transfer", async () => {
    const fromAccount = accounts[2];
    const toAccount = accounts[3];
    const spendingAccount = accounts[4];

    // transfer some tokens to fromAccount
    await token.transfer(fromAccount, 100, { from : accounts[0] });

    //Approve spendingAccount to spend 10 tokens from fromAccount
    await token.approve(spendingAccount, 10, { from: fromAccount });

    //Try transferring something larger than the sender's balance
    try {
      await token.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
      assert.fail("This transaction is not possible, an error should have occured");
    } catch (error) {
      assert(error.message.indexOf("revert") >= 0, "Cannot transfer value larger than balance");
    }  

    //Try transferring something larger than approved amount
    try{
      await token.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
      assert.fail("spendingAccount allowance limit exceeded");
    } catch(error) {
      assert(error.message.indexOf("revert") >=0, "Cannot transfer larger than approved amount");
    }

    const success = await token.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
    assert.equal(success, true, "The call should return true");
    const receipt = await token.transferFrom(fromAccount, toAccount, 5, { from: spendingAccount });
    var fromAccountBalance = await token.balanceOf(fromAccount);
    var toAccountBalance = await token.balanceOf(toAccount);
    assert.equal(fromAccountBalance, 95, "fromAccount balance must have gone down by 5 tokens");      
    assert.equal(toAccountBalance, 5, "toAccount balance must be 5 tokens");
    assert.equal(receipt.logs.length, 1, "Tiggers only one event");
    assert.equal(receipt.logs[0].event, "Transfer", "Should be 'Transfer' event");
    assert.equal(receipt.logs[0].args._from, fromAccount, "Should be owner's account");
    assert.equal(receipt.logs[0].args._to, toAccount, "Should be spender");
    assert.equal(receipt.logs[0].args._value, 5, "Value approved");
    var allowanceAmount = await token.allowance(fromAccount, spendingAccount);
    assert.equal(allowanceAmount, 5, "Remaining allowance is 5");
  

});


});

});
