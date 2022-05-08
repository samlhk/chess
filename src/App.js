import { HashRouter as Router, Route} from 'react-router-dom'
import Menu from './components/Menu'
import Play from './components/Play'


function App() {
  return (
    <Router>
      <div className='container'>
                
        <Route path='/' exact component={Menu}/>

        <Route path='/play' component={Play}/>

      </div>
    </Router>
  );
}

export default App;
