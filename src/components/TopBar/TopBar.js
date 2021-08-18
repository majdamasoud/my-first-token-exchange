import React from 'react';
import './topBar.css';
import ConnectWalletTop from './ConnectWallet/ConnectWalletTop';

function TopBar() {
    return (
        <header>
            <div class="top">
                <div class="pageName">
                    <h1>My Token Exchange</h1>
                </div>
                <div class="connectButton">
                    <ConnectWalletTop />
                </div>
            </div>
        </header>
        
    )
}

export default TopBar;
