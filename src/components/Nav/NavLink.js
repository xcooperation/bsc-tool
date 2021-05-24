import { Link } from "react-router-dom"

export default function NavLink({ id, name, active, to, switchRoute }) {
  return (
    <>
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
    </>
  )
}
