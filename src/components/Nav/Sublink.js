import { Link } from "react-router-dom"

export default function SubLink({ id, name, to }) {
  const handleClick = (e) => {
    // e.preventDefault()
    document.getElementById("navbarDropdown").classList.toggle("d-block")
  }

  return (
    <>
        <Link
          id={id}
          className={`dropdown-item`}
          aria-current="page"
          to={to}
          onClick={handleClick}
        >
          {name}
        </Link>
    </>
  )
}
