import {BsArrow90DegLeft} from "react-icons/bs"

export default function BackBtn({handler}) {
  return (
    <button
      className="btn btn-secondary"
      onClick={handler}
      title="Back">
      <BsArrow90DegLeft />
    </button>
  )
}
