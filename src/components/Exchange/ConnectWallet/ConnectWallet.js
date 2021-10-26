import React from 'react'
import './connectWallet.css'

function ConnectWallet({ connectWallet }) {
    return (
        <div className="connectWalletExchange">
            <button onClick={connectWallet} id="connectWalletButtonExchange">Connect Wallet</button>
        </div>
    )
}

export default ConnectWallet
