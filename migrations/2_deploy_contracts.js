const BTPToken = artifacts.require("BTPToken");
const BTPTokenSale = artifacts.require("BTPTokenSale");

module.exports = async function (deployer) {
   await deployer.deploy(BTPToken, 1000000);
   const tokenPrice = 1000000000000000; //0.001 Ether
   await deployer.deploy(BTPTokenSale, BTPToken.address, tokenPrice);

   token = await BTPToken.deployed();
   tokenSale = await BTPTokenSale.deployed()
   token.transfer(tokenSale.address, 750000);
};
