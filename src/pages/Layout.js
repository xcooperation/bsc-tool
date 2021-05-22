import { BrowserRouter as Router, Route, Switch } from "react-router-dom"

import { GlobalProvider } from "../context/GlobalContext"
import { BscProvider } from "../context/BscContext"
// Pages
import Home from "./Home"
import Wallet from "./Wallet"

export default function Layout() {
  return (
    <>
      <Route exact path="/home">
        <Home />
      </Route>

      <Route exact path="/wallet">
        <Wallet />
      </Route>
    </>
  )
}
