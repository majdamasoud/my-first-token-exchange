import './App.css';
import Exchange from './components/Exchange/Exchange';
import TopBar from './components/TopBar/TopBar';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LiquidityPool from './artifacts/contracts/LiquidityPool.sol/LiquidityPool.json';
import FirstToken from './artifacts/contracts/FirstToken.sol/FirstToken.json';
import {toEther, getOutputString, getInputString} from './helpers'; 

const tokenAddress = "0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf";
const liquidityPoolAddress = "0x0E801D84Fa97b50751Dbf25036d067dCf18858bF";

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
    const balance = await signer.getBalance();
    const signerTokenContract = new ethers.Contract(tokenAddress, FirstToken.abi, signer);
    const signerLPContract = new ethers.Contract(liquidityPoolAddress, LiquidityPool.abi, signer);
    return {
      type: 'signer',
      address,
      balance,
      tokenContract: signerTokenContract,
      lpContract: signerLPContract
    }
  }

  async function connectWallet() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    let data = await getSignerDataAndContracts();
    setTokenContract({type: data.type, contract: data.tokenContract});
    setSignerData({connected: true, address: data.address, balance: data.balance})
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
          setSignerData({connected: true, address: data.address, balance: data.balance})
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
      <Exchange connectWallet={connectWallet} swapFrom={swapFrom} swapTo={swapTo}
      swapFromState={swapFromState} swapToState={swapToState} toAmount={toAmount} fromAmount={fromAmount} onClick={switchTokenFrom}/>
    </div>
  );
}

export default App;
