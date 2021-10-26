import React from 'react';
import './topBar.css';
import ConnectWalletTop from './ConnectWallet/ConnectWalletTop';

function TopBar({connectWallet, signerData}) {

    return (
        <header>
            <div className="top">
                <div className="pageName">
                    <h1>My Token Exchange</h1>
                </div>
                {
                    signerData.connected ? <span>{signerData.address}</span>:
                    <div className="connectButton">
                        <ConnectWalletTop connectWallet={connectWallet}/>
                    </div>
                }      
            </div>
        </header>
        
    )
}

export default TopBar;
