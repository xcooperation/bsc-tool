import logo from '../../logo.svg';
import {Link} from 'react-router-dom'

import {useGlobalContext} from '../../context/GlobalContext'

import NavLink from './NavLink'

import './Nav.css'

export default function Nav() {
  const {navLinks, activeNav} = useGlobalContext()

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="#">
          <img src={logo} alt="logo" className="App-logo" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav">
            {navLinks.map((link, index) => 
              <NavLink
                key = {index}
                name = {link}
                to = {`/${link}`}
                active = {(activeNav) ? true : false}
              />
            )}</ul>
        </div>
      </div>
    </nav>
  )
}
