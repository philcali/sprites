import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import Navigation from './Navigation';
import Home from './Home';
import NewSprite from './NewSprite';
import './App.css';

/**
 * Contains our routes and copyright in the footer.
 */
class App extends React.Component {
  render() {
    return (
      <Router>
        <Navigation/>
        <main>
          <Switch>
            <Route exact path="/"><Home /></Route>
            <Route exact path="/sprites/new"><NewSprite /></Route>
          </Switch>
        </main>
        <footer className="container">
          <p><span dangerouslySetInnerHTML={{ "__html": "&copy;" }}/> Calico. {new Date().getFullYear()}</p>
        </footer>
      </Router>
    );
  }
}

export default App;
