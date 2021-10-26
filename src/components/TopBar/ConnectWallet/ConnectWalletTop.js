import React from 'react';
import './connectWalletTop.css';

function ConnectWalletTop({connectWallet}) {
    return (
        <div className="connectWalletTop">
            <button onClick={connectWallet} id="connectWalletTopButton">Connect Wallet</button>
        </div>
    )
}

export default ConnectWalletTop
