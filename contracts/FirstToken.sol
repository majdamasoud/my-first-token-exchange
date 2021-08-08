//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract FirstToken {

  string private _name = "First Token";
  string private _symbol = "FIRST";
  uint256 private _decimals = 18;
  uint256 private _totalSupply;
  mapping(address => uint256) private _balances; // Map addresses to their current balances
  mapping(address => mapping(address => uint256)) private _allowances; // First Address is owner. Second address is who they allowed to spend their tokens and how much

  event Transfer(address indexed _from, address indexed _to, uint256 _value);
  event Approval(address indexed _owner, address indexed _spender, uint256 _value);


  constructor() {
    _totalSupply = 1000000 * (10 ** _decimals);
    _balances[msg.sender] = _totalSupply;
  }

  function name() public view returns (string memory) {
    return _name;
  }

  function symbol() public view returns (string memory) {
    return _symbol;
  }
  
  function decimals() public view returns (uint256) {
    return _decimals;
  }

  function balanceOf(address _owner) public view returns (uint256 balance) {
    return _balances[_owner];
  }

  function totalSupply() public view returns (uint256) {
    return _totalSupply;
  }

  function transfer(address _to, uint256 _value) public returns (bool success) {
    _transfer(msg.sender, _to, _value);
    return true;
  }
  
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
    require(_allowances[_from][msg.sender] >= _value, "ERC20: Transfer amount exceeds the allowance");

    _allowances[_from][msg.sender] = _allowances[_from][msg.sender] - _value;
    _transfer(_from, _to, _value);
    return true;
  }
  
  function approve(address _spender, uint256 _value) public returns (bool success) {
    require(_balances[msg.sender] >= _value);
    _allowances[msg.sender][_spender] = _value;
    return true;
  }

  function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
    return _allowances[_owner][_spender];
  }

  function _transfer(address _from, address _to, uint256 _value) internal {
    require(_balances[_from] >= _value, "ERC20: Sender balance is less than transfer amount");
    
    _balances[_from] = _balances[_from] - _value;
    _balances[_to] = _balances[_to] + _value;

    emit Transfer(_from, _to, _value);
  }

  
}
