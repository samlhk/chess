import { Link } from 'react-router-dom'

const About = () => {
  return (
    <div className='about-container'>

        <h1>Instructions</h1>
        <h4>Head to Head</h4>
        <p>Two players play against each other. Drag pieces to make moves.</p>

        <h4>Competitive</h4>
        <p>Play against a chess engine. Choose your colour and play on your turn.</p>

        <h1>Support</h1>
        <ul>
            <li>Preferred browsers: Chrome, Firefox, Edge</li>
            <li>Type: Mouse (currently do no support touchscreen devices)</li>
            <li>The engine runs in the frontend with javascript, so performance and play speed may vary with different devices</li>
        </ul>

        <h1>Features</h1>

        <h4>Engine</h4>
        <ul>
            <li>minimax algorithm with depth of 5</li>
            <li>evaluation primarily based on piece values</li>
            <li>opening and endgame bonus: bonus weights for pieces in advantageous positions (example: knights towards the center in the opening and kings towards the center in the endgame)</li>
            <li>checkmate mode: engine finds the fastest mate when checkmate is possible</li>
        </ul>
        

        <h4>Gameplay</h4>
        <ul>
            <li>Legal move indication and enforcement</li>
            <li>Status detection: check, checkmate, stalemate, insufficient material</li>
        </ul>
        

        <h4>Chess</h4>
        <ul>
            <li>Castling</li>
            <li>En passant</li>
            <li>Pawn promotion with choice</li>
        </ul>
        
        <Link to='/'>
          <button className='btn btn-block btn-secondary'>Home</button>
        </Link>

    </div>
  )
}

export default About