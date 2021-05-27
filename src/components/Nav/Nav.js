import logo from "../../logo.svg"
import { Link } from "react-router-dom"
import { useGlobalContext } from "../../context/GlobalContext"

import NavLink from "./NavLink"

import "./Nav.css"

export default function Nav() {
  const { navLinks, subLinks, activeNav, setActiveNav } = useGlobalContext()

  // Switch route
  const switchRoute = (link) => {
    setActiveNav(link)
    navLinks.forEach(nav => {
      const linkElement = document.getElementById(`route-${nav}`)
      
      if (nav === activeNav) {
        linkElement.classList.add("active")
      } else if (linkElement.classList.contains("active")){
        linkElement.classList.remove("active")
      }
    })
  }

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
            {navLinks.map((link, index) => (
              <NavLink
                id={`route-${link}`}
                subLinks={subLinks}
                key={index} 
                name={link} 
                to={`/${link}`} 
                active={activeNav === link ? true : false} 
                switchRoute={e => switchRoute(link)}
                />
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}
