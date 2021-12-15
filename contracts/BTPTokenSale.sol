pragma solidity ^0.6.0;

import "./BTPToken.sol";

contract BTPTokenSale
{
  address payable admin;
  BTPToken public tokenContract;
  uint256 public tokenPrice;
  uint256 public tokensSold;

  event Sell(address _buyer, uint256 _amount);

  constructor(BTPToken _tokenContract, uint256 _tokenPrice) public
  {   
      admin =  msg.sender;
      tokenContract = _tokenContract;
      tokenPrice = _tokenPrice;
     
  }

  
function buyTokens(uint256 _numberOfTokens) public payable 
  {
    require(msg.value == _numberOfTokens * tokenPrice, "Number of tokens doesnot match with the value in wei");
    require(tokenContract.balanceOf(address(this)) >= _numberOfTokens, "Contract does not have enough tokens");
    require(tokenContract.transfer(msg.sender, _numberOfTokens), "Some problem with token transfer");
    tokensSold += _numberOfTokens;
    emit Sell(msg.sender, _numberOfTokens);
  }


function endSale() public payable
{
  require(msg.sender == admin, "Only admin can call this function");
  require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))), "Unable to transfer tokens to admin");
  
  //destroy the contract

  selfdestruct(admin);

}


}