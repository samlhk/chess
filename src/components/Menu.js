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
        <button className='btn btn-block btn-dark'>Coming soon...</button>

        <Footer />
    </div>
  )
}

export default Menu