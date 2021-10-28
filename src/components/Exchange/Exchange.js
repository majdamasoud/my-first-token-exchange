import React from 'react';
import Swap from './Swap/Swap';
import './exchange.css';
import ConnectWallet from './ConnectWallet/ConnectWallet';
import SwapButton from './SwapButton/SwapButton';

function Exchange({ 
    connectWallet,
    signerData, 
    swapFrom, 
    swapTo,
    swapOnClick,
    swapFromState, 
    swapToState, 
    toAmount, 
    fromAmount, 
    switchOnClick}) {
    return (
        <main>
            <div className="exchange">
                <div className="exchangeBox">
                    <div className="boxLabel">
                        <span>Exchange</span>
                    </div>
                    <div className="exchanging">
                        <Swap symbol={swapFrom} amount={fromAmount} onChange={swapFromState}/>
                        <div className="switchTokenFrom">
                            <button onClick={switchOnClick}>
                                <span className="iconify" data-icon="mdi:swap-vertical" data-height="20"></span>
                            </button>
                        </div>
                        <Swap symbol={swapTo} amount={toAmount} onChange={swapToState}/>
                    </div>
                    <div className="bottomButton">
                        {
                            signerData.connected ? <SwapButton onClick={swapOnClick}/> :<ConnectWallet connectWallet={connectWallet}/>
                        }
                    </div>
                    
                </div>
            </div>
        </main>
    )
}

export default Exchange;
