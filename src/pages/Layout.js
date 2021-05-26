import { Route } from "react-router-dom"

// Pages
import Home from "./Home"
import Wallet from "./Wallet/Wallet"
import Pool from "./Pool/Pool"
import Swap from "./Swap/Swap"
import Listcoin from "./Listcoin/Listcoin"

export default function Layout() {
  return (
    <>
      <Route exact path="/home">
        <Home />
      </Route>

      <Route exact path="/wallet">
        <Wallet />
      </Route>

      <Route exact path="/pool">
        <Pool />
      </Route>
      
      <Route exact path="/swap">
        <Swap />
      </Route>

      <Route exact path="/List">
        <Listcoin />
      </Route>
    </>
  )
}
