import { Route } from 'react-router-dom'
import Homepage from './components/Homepage'
import Game from './components/Game.js'
import './App.css'
import './cards.css'
import './game.css'

const App = () => {
  return (
    <div className="App">
      <Route path='/' exact component={Homepage} />
      <Route path='/play' exact component={Game} />
    </div>
  )
}

export default App
