import React from 'react';
import SwapFrom from './SwapFrom/SwapFrom';
import './exchange.css';
import SwapTo from './SwapTo/SwapTo';

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
                        <SwapTo />
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Exchange;
