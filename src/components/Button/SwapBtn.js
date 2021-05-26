import {RiExchangeDollarLine} from 'react-icons/ri'
import DropdownBtn from './DropdownBtn'
import {pairs} from '../../constant/Pair'

export default function SwapBtn({pair, setPair, handler}) {
  return (
    <div className="btn-group mr-2">
    <button 
      className="btn"
      style={{backgroundColor: "#f5c373"}}
      title="Balance" 
      onClick={handler}>
      <RiExchangeDollarLine /> Swap
    </button>

    <DropdownBtn
      items={pairs}
      token={pair}
      setToken={setPair}
      handler={handler} 
      name='swap'
      style={{backgroundColor: "#fab23e"}}/>
  </div>
  )
}
