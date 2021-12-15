pragma solidity ^0.6.0;

contract BTPToken
{
    string public name = "BTPToken"; //optional
    string public symbol = "BTP";    //optional
    string public standard = "BTPToken V1.0";    //Not in documentation, extra.

    uint256 public totalSupply;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256)public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(uint256 _initialSupply) public
    {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;

    }

    function transfer(address _to, uint256 _value) public returns (bool success)
    {
        require(balanceOf[msg.sender] >= _value, "No sufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;

    }

    function approve(address _spender, uint256 _value) public returns (bool success)
    {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)
    {
        require(balanceOf[_from] >= _value, "_from does not have enough tokens to transfer");
        require(allowance[_from][msg.sender] >= _value, "Spender does not have enough amount to spend");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }


    



}
