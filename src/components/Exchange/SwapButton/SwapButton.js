import React from 'react'
import './swapButton.css'

function SwapButton({onClick}) {
    return (
        <div className="SwapButton">
            <button id="swapButtonExchange" onClick={onClick}>Swap</button>
        </div>
    )
}

export default SwapButton
