import {MdAccountBalanceWallet} from 'react-icons/md'
import DropdownBtn from './DropdownBtn'

export default function BalanceBtn({token, setToken, handler, list_of_tokens}) {
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
      items={list_of_tokens}
      token={token}
      setToken={setToken}
      handler={handler} 
      name='balance'
      style={{backgroundColor: "#35a0bd"}}/>
  </div>
  )
}
