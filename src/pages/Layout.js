import { Route } from "react-router-dom"

// Pages
import Home from "./Home"
import Wallet from "./Wallet/Wallet"

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
