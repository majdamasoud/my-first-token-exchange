import React from 'react';
import './topBar.css';

function TopBar() {
    return (
        <header>
            <div class="top">
                <div class="pageName">
                    <h1>My Token Exchange</h1>
                </div>
                <div class="exchangeNavigation">
                    <ul>
                        <li class="navigationLink">
                            Exchange
                        </li>
                        <li class="navigationLink">
                            Provide
                        </li>
                    </ul>
                </div>
                <div class="connectWalletButton">
                    <button id="connectWallet">Connect Wallet</button>
                </div>
            </div>
        </header>
        
    )
}

export default TopBar;
