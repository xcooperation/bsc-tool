import { useState } from "react"
import {BNB} from '../../constant/BEP20'
// Components
import Input from "./Input"
import Logger from "./Logger"
import Result from "./Result"

// STAGES
const STAGES = ['input', 'logger', 'result']

export default function Swap() {
  const [stage, setStage] = useState(STAGES[0])
  const [data, setData] = useState([])
  const [pair, setPair] = useState("")
  const [token, setToken] = useState(BNB)

  return (
    <div className="container-fluid my-3">
      <div className="card">
        {/* Generate */}
        {stage === 'input' && (
          <Input 
            data={data}
            setData={setData}
            pair={pair}
            setPair={setPair}
            setStage={setStage}
          />
        )}

        {/* Spread */}
        {stage === 'logger' && (
          <Logger 
            data={data}
            pair={pair}
            setStage={setStage}
          />
        )}

        {/* Result */}
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
