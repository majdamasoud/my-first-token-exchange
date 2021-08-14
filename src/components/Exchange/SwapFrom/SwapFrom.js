import React from 'react';
import './swapFrom.css';

function SwapFrom() {
    return (
        <div class="swapFrom">
            <div class="tokenFrom">
                <div class="tokenFromLabel">
                    <text>ETH</text>
                </div>
                <div class="tokenFromAmount">
                    <input type="text" placeholder="0.0"></input>
                </div>
            </div>
            <div class="switchTokenFrom">
                <button>Switch</button>
            </div>
        </div>
    )
}

export default SwapFrom;
