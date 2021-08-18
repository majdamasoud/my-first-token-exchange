import React from 'react'
import './swapTo.css';

function SwapTo() {
    return (
        <div class="swapTo">
            <div class="tokenToLabel">
                <text>FIRST</text>
            </div>
            <div class="tokenToAmount">
                <input inputmode="decimal"
                    autocomplete="off"
                    autocorrect="off"
                    type="text"
                    pattern="^[0-9]*[.,]?[0-9]*$"
                    placeholder="0.0"
                    minlength="1"
                    maxlength="79" 
                    spellcheck="false"
                    value="" />
            </div>
        </div>
    )
}

export default SwapTo
