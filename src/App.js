import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'

import Nav from './components/Nav/Nav'
import Layout from './pages/Layout'

import {GlobalProvider} from './context/GlobalContext'
import {BscProvider} from './context/BscContext'

function App() {
  return (
    <Router>
      <Switch>
        <GlobalProvider>
          <Nav />
          <BscProvider>
            <Layout></Layout>
          </BscProvider>
        </GlobalProvider>
      </Switch>
    </Router>
  );
}

export default App;
