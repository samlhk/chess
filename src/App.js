import { HashRouter as Router, Route} from 'react-router-dom';
import Menu from './components/Menu';
import Play from './components/Play';
import Competitive from './components/Competitive';
import About from './components/About';

function App() {
  return (
    <Router>
      <div className='container'>
                
        <Route path='/' exact component={Menu}/>

        <Route path='/play' component={Play}/>

        <Route path='/competitive' component={Competitive}/>

        <Route path='/about' component={About}/>

      </div>
    </Router>
  );
}

export default App;
