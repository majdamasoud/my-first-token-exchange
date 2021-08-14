import React from 'react'
import './swapTo.css';

function SwapTo() {
    return (
        <div class="swapTo">
            <div class="tokenToLabel">
                <text>FIRST</text>
            </div>
            <div class="tokenToAmount">
                <input type="text" placeholder="0.0"></input>
            </div>
        </div>
    )
}

export default SwapTo
