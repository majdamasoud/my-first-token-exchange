import React from 'react';
import './swap.css';

function Swap(props) {
    return (
        <div className="swap">
            <div className="tokenLabel">
                <span>{props.symbol}</span>
            </div>
            <div className="tokenAmount">
                <input inputMode="decimal" 
                    autoComplete="off" 
                    autoCorrect="off"
                    type="text"
                    placeholder="0.0" 
                    minLength="1" 
                    maxLength="79" 
                    spellCheck="false"
                    onChange={e => props.onChange(e.target.value)}
                    value={props.amount}/>
            </div>
        </div>
    )
}

export default Swap;
