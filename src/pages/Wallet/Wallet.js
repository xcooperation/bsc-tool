import { useState } from "react"
import {BNB} from '../../constant/BEP20'
// Components
import Generate from "./Generate"
import Balance from "./Balance"
import Spread from "./Spread"
import Collect from "./Collect"
import Result from "./Result"
import "./Wallet.css"

// STAGES
const STAGES = ['generate', 'balance', 'spread', 'collect', 'result']

export default function Wallet() {
  const [stage, setStage] = useState(STAGES[0])
  const [data, setData] = useState([])
  const [token, setToken] = useState(BNB)
  const [mainWallet, setMainWallet] = useState(null)
  const [amount, setAmount] = useState(0)

  return (
    <div className="container-fluid my-3">
      <div className="card">
        {/* Generate */}
        {stage === 'generate' && (
          <Generate 
            data={data}
            setData={setData}
            token={token}
            setToken={setToken}
            setStage={setStage}
          />
        )}

        {/* Balance */}
        {stage === 'balance' && (
          <Balance 
            data={data}
            token={token}
            setStage={setStage}
          />
        )}

        {/* Spread */}
        {stage === 'spread' && (
          <Spread 
            data={data}
            token={token}
            setStage={setStage}
            mainWallet={mainWallet}
            setMainWallet={setMainWallet}
            amount={amount}
            setAmount={setAmount}
          />
        )}

        {/* Collect */}
        {stage === 'collect' && (
          <Collect 
            data={data}
            token={token}
            setStage={setStage}
            mainWallet={mainWallet}
            setMainWallet={setMainWallet}
          />
        )}

        {/* Logger */}
        {stage === 'result' && (
          <Result 
            data={data}
            setStage={setStage}
          />
        )}
      </div>
    </div>
  )
}
