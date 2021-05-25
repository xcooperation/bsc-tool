import { FaBuffer } from "react-icons/fa"
import {BNB, DPC, SLC} from '../../constant/BEP20'
import DropdownBtn from './DropdownBtn'

export default function CollectBNBBtn({ handler, token, setToken }) {
  return (
    <div className="btn-group mr-2">
      <button
        style={{ backgroundColor: "#27aae3" }}
        type="button"
        className="btn"
        onClick={handler}
      >
        <FaBuffer className="mr-1" /> Collect
      </button>

      <DropdownBtn
        items={[BNB, DPC, SLC]}
        token={token}
        setToken={setToken}
        handler={handler}
        name="collect"
        style={{ backgroundColor: "#03b1fc" }}
      />
    </div>
  )
}
