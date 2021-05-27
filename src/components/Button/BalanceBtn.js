import {MdAccountBalanceWallet} from 'react-icons/md'
import DropdownBtn from './DropdownBtn'
import {DPC, SLC, BNB, WBNB} from '../../constant/BEP20'

export default function BalanceBtn({token, setToken, handler}) {
  return (
    <div className="btn-group mr-2">
    <button 
      className="btn"
      style={{backgroundColor: "#328fa8"}}
      title="Balance" 
      onClick={handler}>
      <MdAccountBalanceWallet /> Balance
    </button>

    <DropdownBtn
      items={[BNB, DPC, SLC, WBNB]}
      token={token}
      setToken={setToken}
      handler={handler} 
      name='balance'
      style={{backgroundColor: "#35a0bd"}}/>
  </div>
  )
}
