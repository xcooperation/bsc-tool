import {SiFitbit} from 'react-icons/si'
import {DPC, SLC, BNB} from '../../constant/BEP20'
import DropdownBtn from './DropdownBtn'

export default function SpreadBNBBtn({handler, token, setToken}) {

  return (
    <div className="btn-group mr-2">
      <button 
        style={{backgroundColor: "#c9d91c"}}
        type="button" 
        className="btn"
        onClick={handler}>
        <SiFitbit className="mr-1" /> Spread
      </button>

    <DropdownBtn
      items={[BNB, DPC, SLC]}
      token={token}
      setToken={setToken}
      handler={handler} 
      name='spread'
      style={{backgroundColor: "#dae657"}}/>
    </div>
  )
}
