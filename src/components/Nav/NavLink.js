import {Link} from 'react-router-dom'

export default function NavLink({name, active, to}) {
  return (
    <>
      <li className="nav-item">
        <Link 
          className={`nav-link ${active ? 'active' : ''}`} 
          aria-current="page" 
          to={to}
        >
          {name}
        </Link>
      </li>
    </>
  )
}
