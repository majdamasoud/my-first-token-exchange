import React from 'react';
import './swapFrom.css';

function SwapFrom() {
    return (
        <div class="swapFrom">
            <div class="tokenFromLabel">
                <text>ETH</text>
            </div>
            <div class="tokenFromAmount">
                <input inputmode="decimal" 
                    autocomplete="off" 
                    autocorrect="off" 
                    type="text" 
                    pattern="^[0-9]*[.,]?[0-9]*$" 
                    placeholder="0.0" 
                    minlength="1" 
                    maxlength="79" 
                    spellcheck="false" 
                    value=""/>
            </div>
        </div>
    )
}

export default SwapFrom;
