import { FaBuffer } from "react-icons/fa"
import DropdownBtn from './DropdownBtn'

export default function CollectBNBBtn({ handler, token, setToken, list_of_tokens }) {
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
        items={list_of_tokens}
        token={token}
        setToken={setToken}
        handler={handler}
        name="collect"
        style={{ backgroundColor: "#03b1fc" }}
      />
    </div>
  )
}
