import './App.css';
import Exchange from './components/Exchange/Exchange';
import TopBar from './components/TopBar/TopBar';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LiquidityPool from './artifacts/contracts/LiquidityPool.sol/LiquidityPool.json';
import FirstToken from './artifacts/contracts/FirstToken.sol/FirstToken.json';
import {toEther, tokens, getOutputString, getInputString} from './helpers'; 

const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const liquidityPoolAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

function App() {
  // getting instances of contracts and signer
  const [liquidityPoolContract, setLiquidityPoolContract] = useState({});
  const [tokenContract, setTokenContract] = useState({});
  const [signerData, setSignerData] = useState({connected: false});
  const [swapFrom, setSwapFrom] = useState('ETH');
  const [swapTo, setSwapTo] = useState('FIRST');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [poolData, setPoolData] = useState({});

  function handleSwapButtonClick() {
    console.log("EthBalance: ", signerData.ethBalance)
    console.log("from amount: ", parseFloat(fromAmount) < signerData.ethBalance);
    console.log(poolData)
    if (fromAmount === '') {
      window.alert('Please Enter Amount');
    } else if (swapFrom === 'ETH' && parseFloat(fromAmount) > signerData.ethBalance){
      window.alert('Insufficient ETH Balance');
    } else if (swapFrom === 'FIRST' && parseFloat(fromAmount) > signerData.tokenBalance){
      window.alert('Insufficient ETH Balance');
    } else if (swapTo === 'ETH' && parseFloat(toAmount) > poolData.ethPool){
      window.alert('Insufficient ETH Pool');
    } else if (swapTo === 'FIRST' && parseFloat(toAmount) > poolData.tokenPool){
      window.alert('Insufficient FIRST Pool');
    } else {
      if (swapFrom === 'ETH') {
        ethToTokenSwap();
      } else {
        tokenToEthSwap();
      }
    }
  }

  async function tokenToEthSwap() {
    tokenContract.contract.approve(liquidityPoolAddress, tokens(fromAmount));
    liquidityPoolContract.contract.tokenToEth(tokens(fromAmount));
    let data = await getSignerDataAndContracts();
    setTokenContract({type: data.type, contract: data.tokenContract});
    setLiquidityPoolContract({type: data.type, contract: data.lpContract});
    setSignerData({connected: true, address: data.address, ethBalance: data.ethBalance, tokenBalance: data.tokenBalance});
  }

  async function ethToTokenSwap() {
    liquidityPoolContract.contract.ethToToken({from: signerData.address, value: tokens(fromAmount)});
    let data = await getSignerDataAndContracts();
    setTokenContract({type: data.type, contract: data.tokenContract});
    setLiquidityPoolContract({type: data.type, contract: data.lpContract});
    setSignerData({connected: true, address: data.address, ethBalance: data.ethBalance, tokenBalance: data.tokenBalance});
  }



  const rx_live = /^[+-]?\d*(?:[.,]\d*)?$/;

  function swapFromState(input) {
    if (rx_live.test(input)) {
      setFromAmount(input);
      if (!isNaN(parseFloat(input))) {
        let amount = swapFrom === 'ETH'? getOutputString(input, poolData.ethPool, poolData.tokenPool) : getOutputString(input, poolData.tokenPool, poolData.ethPool);
        setToAmount(amount);
      } else {
        setToAmount('');
      }
    }
  }

  function switchTokenFrom() {
    let newSwapFrom = swapTo;
    setSwapTo(swapFrom);
    setSwapFrom(newSwapFrom);
    setFromAmount('');
    setToAmount('');
  }

  function swapToState(output) {
    if (rx_live.test(output)) {
      setToAmount(output);
      if (!isNaN(parseFloat(output))) {
        let amount = swapTo === 'ETH'? getInputString(output, poolData.tokenPool, poolData.ethPool) : getInputString(output, poolData.ethPool, poolData.tokenPool);
        setFromAmount(amount);
      } else {
        setFromAmount('')
      }
    }
  }

  async function getSignerDataAndContracts() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const ethBalance = await signer.getBalance();
    const signerTokenContract = new ethers.Contract(tokenAddress, FirstToken.abi, signer);
    const signerLPContract = new ethers.Contract(liquidityPoolAddress, LiquidityPool.abi, signer);
    const getTokenBalance = await signerTokenContract.balanceOf(address);
    const tokenBalance = getTokenBalance ? getTokenBalance : tokens('0');

    return {
      type: 'signer',
      address,
      ethBalance: toEther(ethBalance.toString()),
      tokenBalance: toEther(tokenBalance.toString()),
      tokenContract: signerTokenContract,
      lpContract: signerLPContract
    }
  }

  async function connectWallet() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    let data = await getSignerDataAndContracts();
    setTokenContract({type: data.type, contract: data.tokenContract});
    setLiquidityPoolContract({type: data.type, contract: data.lpContract});
    setSignerData({connected: true, address: data.address, ethBalance: data.ethBalance, tokenBalance: data.tokenBalance});
  }

  useEffect(() => {
    const getBlockchainData = async () => {
      if (window.ethereum !== undefined) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          return await getSignerDataAndContracts();
        } else {
          const providerTokenContract = new ethers.Contract(tokenAddress, FirstToken.abi, provider);
          const providerLPContract = new ethers.Contract(liquidityPoolAddress, LiquidityPool.abi, provider);
          return {type: 'provider', tokenContract: providerTokenContract, lpContract: providerLPContract}
        }
      } else {
        window.alert('Please install MetaMask')
        window.location.assign("https://metamask.io/")
      }
    }

    getBlockchainData()
      .then(data => {
        setTokenContract({type: data.type, contract: data.tokenContract});
        setLiquidityPoolContract({type: data.type, contract: data.lpContract});
        if (data.type === 'signer') {
          setSignerData({connected: true, address: data.address, ethBalance: data.ethBalance, tokenBalance: data.tokenBalance})
        }
      })
  }, []);

  useEffect(() => {
    const runPoolData = async () => {
      if (liquidityPoolContract.contract !== undefined) {
        const ethPool = await liquidityPoolContract.contract.ethPool();
        const tokenPool = await liquidityPoolContract.contract.tokenPool();
        return {ethPool, tokenPool}
      }
    }

    runPoolData()
      .then(data => {
        if (data !== undefined){
          setPoolData({ethPool: toEther(data.ethPool.toString()), tokenPool: toEther(data.tokenPool.toString())})
        }
      });
  }, [liquidityPoolContract])

  return (
    <div className="App">
      <TopBar connectWallet={connectWallet} signerData={signerData}/>
      <Exchange connectWallet={connectWallet} signerData={signerData} swapFrom={swapFrom} swapTo={swapTo} swapOnClick={handleSwapButtonClick}
      swapFromState={swapFromState} swapToState={swapToState} toAmount={toAmount} fromAmount={fromAmount} switchOnClick={switchTokenFrom}/>
    </div>
  );
}

export default App;
