import { Link } from 'react-router-dom'

import Header from './Header'
import Footer from './Footer'

const Menu = () => {
  return (
    <div>
        <Header />

        <Link to='/play'>
            <button className='btn btn-block btn-info'>Head to Head</button>
        </Link><br/>
        
        <Link to='/competitive'>
          <button className='btn btn-block btn-success'>Competitive</button>
        </Link><br/>

        <Link to='/about'>
          <button className='btn btn-block btn-dark'>About</button>
        </Link>

        <Footer />
    </div>
  )
}

export default Menu