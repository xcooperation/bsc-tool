import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import SubLink from "./Sublink"

export default function NavLink({ id, name, active, to, switchRoute, subLinks }) {
  const [sub, setSub] = useState("")

  useEffect(() => {
    const subs = Object.keys(subLinks)
    const hasSub = subs.find((prop) => prop === name)
    if (hasSub) {
      setSub(subLinks[hasSub])
    }

  }, [])
  
  // Toggle dropdown
  const toggleDropDown = () => {
    document.getElementById("navbarDropdown").classList.toggle("d-block")
  }

  return (
    <>
      {!sub && (
        <li className="nav-item">
          <Link
            id={id}
            className={`nav-link ${active ? "active" : ""}`}
            aria-current="page"
            to={to}
            onClick={switchRoute}
          >
            {name}
          </Link>
        </li>
      )}

      {sub && (
        <li className="nav-item dropdown">
          <Link
            key={id}
            className={`nav-link dropdown-toggle ${active ? "active" : ""}`}
            to="#"
            role="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
            onClick={toggleDropDown}
          >
            {name}
          </Link>
          <div id="navbarDropdown" className="dropdown-menu" aria-labelledby="navbarDropdown">
            {sub.map((sublink, index) => (
              <SubLink
                id={index}
                name={sublink}
                to={`/${name}/${sublink}`}
              />
            ))}
          </div>
        </li>
      )}
    </>
  )
}
