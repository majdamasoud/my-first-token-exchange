import React from 'react';
import SwapFrom from './SwapFrom/SwapFrom';
import './exchange.css';
import SwapTo from './SwapTo/SwapTo';
import ConnectWallet from './ConnectWallet/ConnectWallet';

function Exchange() {
    return (
        <main>
            <div class="exchange">
                <div class="exchangeBox">
                    <div class="boxLabel">
                        <text>Exchange</text>
                    </div>
                    <div class="exchanging">
                        <SwapFrom />
                        <div class="switchTokenFrom">
                            <span class="iconify" data-icon="mdi:swap-vertical" data-height="20"></span>
                        </div>
                        <SwapTo />
                    </div>
                    <div class="connect">
                        <ConnectWallet />
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Exchange;
