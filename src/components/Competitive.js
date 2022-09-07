import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import King from './piece/King'
import Queen from './piece/Queen'
import Bishop from './piece/Bishop'
import Knight from './piece/Knight'
import Rook from './piece/Rook'
import Pawn from './piece/Pawn'
import Panel from './Panel'
import Selection from './Selection'
import ChoosingMenu from './ChoosingMenu'
import { checkMovePossible, possibleMoves, handleCastling, handleEnPassant, inCheck,
  resetBoardColors, parsePieceId, setStartingPieces,
  boardTemplate, createBoardTemplate,fileLegend, rankLegend, startingPosition, endGameMessages
   } from './util'

let movingPiece = '';

// todo: touch screen
// todo: safari -> useeffect becomes uselayouteffect in safari

const Competitive = () => {
  const [board, updateBoard] = useState(startingPosition)

  // white: 1    black: -1
  const [turn, updateTurn] = useState(1)

  const [status, updateStatus] = useState(gameState.CHOOSING)

  // [piece id, piece color]
  const [promotedPieceInfo, updatePromotedPieceInfo] = useState([0, 0])

  const [perspective, updatePerspective] = useState(1)

  const [moveNumber, updateMoveNumber] = useState(1)

  useEffect(() => {
    if (status === gameState.ENGINE_TURN) {
      ongoingEngine = true
      engineMove(turn)
      // check if game is terminated after engine moves
      if (ongoingEngine) {
        updateStatus(gameState.PLAYER_TURN)
      }
    }    
  })


  // behavior when dragging over cells
  const onDragOver = (e) => {
    e.preventDefault()
  }
  
  // record the identity of the piece
  const onDragStart = (pieceId) => {
    movingPiece = pieceId;
  }
  
  // behavior when dropped onto final cell
  const drop = (toCellId, e, enginePieceId) => {
    let pieceId;
    // player dropping the piece manually
    if (e) {
      //e.preventDefault()
      pieceId = parseInt(movingPiece);
      resetBoardColors()
    } 
    // engine created drop piece
    else {
      pieceId = enginePieceId
    }

    
    let newBoard = [[],[],[],[],[],[],[],[]];
    for (let i=0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        newBoard[i][j] = board[i][j]
      }
    }

    // find the cell the piece is coming from
    let fromCellId = [-1, -1]
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (newBoard[i][j] === pieceId) {fromCellId = [i, j]}
      }
    }

    const fromRank = fromCellId[0]
    const fromFile = fromCellId[1]
    const toRank = parseInt(toCellId[0])
    const toFile = parseInt(toCellId[1])
    const piece = parsePieceId[pieceId]

    let currentBoardInfo = {
      'board': newBoard,
      'fromRank': fromRank,
      'fromFile': fromFile,
      'toRank': toRank,
      'toFile': toFile,
      'piece': piece,
      'turn': turn,
    }

    // check if the move is legal
    if ((status === gameState.PLAYER_TURN || status === gameState.ENGINE_TURN) && checkMovePossible(currentBoardInfo)) {
        // switch to engine's turn
        if (status !== gameState.ENGINE_TURN) {
          updateStatus(gameState.ENGINE_TURN)
        }

        if (turn === -1) {
          updateMoveNumber(moveNumber + 1)
        }

        handleEnPassant(currentBoardInfo)

        // make the move on the board
        newBoard[fromRank][fromFile] = 0
        newBoard[toRank][toFile] = pieceId

        handlePromotion(pieceId, toRank)
        handleCastling(piece, newBoard, toRank, toFile)

        checkCheckmate(newBoard, turn * -1)
        checkInsufficient(newBoard)
        
        updateTurn(turn * -1)

      }

    updateBoard(newBoard)    
  }

  const checkCheckmate = (board, turn) => {
    let allMoves = []
    scanningBoard:
      for (let i=0; i < 8; i++) {
        for (let j=0; j < 8; j++) {
          let pieceId = board[i][j]
          if (pieceId > 0) {
            let moves = possibleMoves(board, i, j, parsePieceId[pieceId], turn)
            if (moves.length > 0) {
              allMoves.push([pieceId, moves])
              break scanningBoard
            }
          }
        }
      }
    if (allMoves.length === 0) {
      if (inCheck({'board': board, 'color': turn})) {
        updateStatus(turn === 1 ? gameState.BLACK_CHECKMATE : gameState.WHITE_CHECKMATE)
        ongoingEngine = false
      }
      else {
        updateStatus(gameState.STALEMATE)
        ongoingEngine = false
      }
      
    }
  }


  const checkInsufficient = (board) => {
    let whiteMinorCount = 0
    let blackMinorCount = 0
    let whiteBishopCount = 0
    let blackBishopCount = 0
    let whiteBishop
    let blackBishop
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let piece = parsePieceId[board[i][j]]
        if (piece) {

          if (piece instanceof Knight) {
            if (piece.color === 1) {whiteMinorCount++}
            else {blackMinorCount++}
          }

          else if (piece instanceof Bishop) {
            if (piece.color === 1) {whiteMinorCount++; whiteBishopCount++; whiteBishop = piece}
            else {blackMinorCount++; blackBishopCount++; blackBishop = piece}
          }

          else if (!(piece instanceof King)) {
            return
          }

        }
      }
    }

    // King v King
    if (whiteMinorCount === 0 && blackMinorCount === 0) {
      updateStatus(gameState.INSUFFICIENT)
      ongoingEngine = false
      return
    }
    // King + minor v King
    if ((whiteMinorCount === 0 && blackMinorCount === 1) || (whiteMinorCount === 1 && blackMinorCount === 0)){
      updateStatus(gameState.INSUFFICIENT)
      ongoingEngine = false
      return
    }
    // King + Bishop v King + Bishop (same color)
    if (whiteBishopCount === 1 && blackBishopCount === 1) {
      if (whiteBishop.bishopColor === blackBishop.bishopColor) {
        updateStatus(gameState.INSUFFICIENT)
        ongoingEngine = false
        return
      }
    }

  }

  const onResign = () => {
    updateStatus(turn === 1 ? gameState.WHITE_RESIGN : gameState.BLACK_RESIGN)
  }

  // prompt the player to choose the promoted piece if needed
  const handlePromotion = (pieceId, toRank) => {
    let piece = parsePieceId[pieceId]
    if (piece instanceof Pawn) {
      if (toRank === (piece.color === 1 ? 0 : 7)) {
        if (status === gameState.ENGINE_TURN) {
          parsePieceId[pieceId] = new Queen(piece.color, pieceId)
        } else {
          updateStatus(gameState.SELECTING)
          updatePromotedPieceInfo([pieceId, piece.color])
        }
      }
    }
  }

  // put down the promoted piece indicated by the player
  const resolvePromotion = (promotion) => {
    const pieceId = promotedPieceInfo[0]
    const pieceColor = promotedPieceInfo[1]
    switch (promotion) {
      case 'q':
        parsePieceId[pieceId] = new Queen(pieceColor, pieceId)
        break
      case 'r':
        parsePieceId[pieceId] = new Rook(pieceColor, pieceId)
        break
      case 'b':
        parsePieceId[pieceId] = new Bishop(pieceColor, pieceId)
        break
      case 'n':
        parsePieceId[pieceId] = new Knight(pieceColor, pieceId)
        break
      default:
        break
    }
    updateStatus(gameState.ENGINE_TURN)

    checkCheckmate(board, turn)
  }


  const resetBoard = () => {
    setStartingPieces()
    updateBoard(startingPosition)
    updateTurn(1)
    updateStatus(gameState.CHOOSING)
    updateMoveNumber(1)
    updatePromotedPieceInfo([0, 0])
  }


  const flipBoard = () => {
    updatePerspective(perspective * -1)
    rankLegend.reverse()
    fileLegend.reverse()
  }

  const chooseSide = (color) => {
    updatePerspective(color)

    // set the first moving side
    if (color === 1) {
      updateStatus(gameState.PLAYER_TURN)
    } else {
      updateStatus(gameState.ENGINE_TURN)
    }
  }

  const engineMove = (turn) => {

    let [enginePieceId, move] = generateEngineMove(board, turn, moveNumber)

    drop(move[0].toString().concat(move[1].toString()), false, enginePieceId)
  }

  return (
    <>
      {status === gameState.CHOOSING ? <ChoosingMenu onChoose={chooseSide}/> :

      <div id='game-wrapper'>
        <div id='play-area'>
          <div id='side-legend'>
            {rankLegend.map((rank) => <div key={rank}>{rank}</div>)}
          </div>
          <div>
            <div id='top-legend'>
              {fileLegend.map((file) => <div key={file}>{file}</div>)}
            </div>
            <div id='board'>
            {boardTemplate.map((cell) => {

                const cellId = perspective === 1 ? cell.id : 
                (7 - parseInt(cell.id[0])).toString().concat((7 - parseInt(cell.id[1])).toString())

                return (<div className={`cell ${cell.isWhite ? 'white-cell' : 'black-cell'} `} id={cellId} key={cellId}
                  onDragOver={(e) => {onDragOver(e)}} onDrop={(e) => {drop(cellId, e)}} >

                    {(() => {
                      let pieceId = board[parseInt(cellId[0])][parseInt(cellId[1])]
                    if (pieceId > 0) {return (
                    <img src={parsePieceId[pieceId].render()}  alt=''
                      draggable onDragStart={(e) => {onDragStart(pieceId); indicatePossibleMoves(board, 
                        parseInt(cellId[0]), parseInt(cellId[1]), parsePieceId[pieceId], turn, status)}}
                      onDragEnd={resetBoardColors} className='pointer' />)}}
                      )()}

                </div>)})}

            </div>
          </div>
        </div>

        <div id='panel'>
          <div>
            <Link to='/'>
              <button className='btn btn-block btn-secondary'>Home</button>
            </Link><br/>
            <h1>Move: {moveNumber}</h1>
            {(() => {
                switch(status) {
                  case gameState.PLAYER_TURN:
                    return (<Panel turn={turn} onResign={onResign}/>)
                  case gameState.ENGINE_TURN:
                    return (<Panel turn={turn} engineCalculating={true} />)
                  case gameState.SELECTING:
                    return (<Selection turn={turn * -1} onResolve={resolvePromotion} />)
                  default:
                    return (<div id='end-game'>
                              <div>{endGameMessages[status]}</div>
                              <button className='board-control-btn' onClick={resetBoard}>
                                <i className='fa fa-refresh pointer' />
                              </button>
                            </div>)
                }
            })()}
            {status !== gameState.ENGINE_TURN && <button className='board-control-btn' onClick={flipBoard}>
              <i className='fa fa-exchange fa-3x fa-rotate-90 pointer'/>
            </button>}
          </div>
        </div>
      </div>}
    </>
  )
}

export default Competitive

/////////////////////////////////////////////////////////////
// Engine ///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

const generateEngineMove = (board, turn, moveNumber) => {

  optimalEngineMove = [-1, [0, 0, 0, 0]]

  const minimaxResult = minimax(board, turn, ENGINE_DEPTH, -Infinity, Infinity, turn === 1 ? true: false, moveNumber)
  console.log('current evaluation', minimaxResult)

  let whitePieceCount = 0
  let blackPieceCount = 0
  for (let i=0; i < 8; i++) {
    for (let j=0; j < 8; j++) {
      if (board[i][j] > 0) {
        let piece = parsePieceId[board[i][j]]
        if (piece.color === 1) {whitePieceCount++}
        else {blackPieceCount++}
      }
    }
  }
  // enter endgame checkmate mode
  if (minimaxResult === (turn === 1 ? Infinity : -Infinity) && 
    (whitePieceCount < endgameCheckmatePieceThreshold || blackPieceCount < endgameCheckmatePieceThreshold)) {
    optimalEngineMove = checkMovesForFastestMate(board, turn)
  }

  let enginePieceId = optimalEngineMove[0]
  let move = optimalEngineMove[1].slice(2, 4)

  return [enginePieceId, move]
}

// gives optimal value for this board position this turn
const minimax = (board, turn, depth, alpha, beta, maximizingPlayer, moveNumber) => {
  
  let allMoves = []
  let capturePiece = []
  let capturePawn = []
  let regularMoves = []
  for (let i=0; i < 8; i++) {
    for (let j=0; j < 8; j++) {
      let pieceId = board[i][j]
      if (pieceId > 0) {
        let moves = possibleMoves(board, i, j, parsePieceId[pieceId], turn)
        for (let z=0; z < moves.length; z++) {
          let moveInformation = [pieceId,[i, j, moves[z][0], moves[z][1]]]
          
          // order moves with human intuition
          // capture piece -> capture pawn -> ... -> (move into pawn captured)
          if (doesCapturePiece(board, moves[z])) {
            capturePiece.push(moveInformation)
          } 
          else if (doesCapturePawn(board, moves[z])) {
            capturePawn.push(moveInformation)
          } 
          else {
            regularMoves.push(moveInformation)
          }
        }
      }
    }
  }
  allMoves = capturePiece.concat(capturePawn).concat(regularMoves)

  if (allMoves.length === 0) {
    return evaluate(board, moveNumber)
  }

  if (depth === 0) {
    return minimaxCaptures(board, turn, alpha, beta, maximizingPlayer, moveNumber)
  }


  let value = maximizingPlayer ? -Infinity : Infinity

  for (let i=0; i < allMoves.length; i++) {
    let hypotheticalBoard = [[],[],[],[],[],[],[],[]];
    for (let i=0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        hypotheticalBoard[i][j] = board[i][j]
      }
    }
    let [pieceId, [fromRank, fromFile, toRank, toFile]] = allMoves[i]

    hypotheticalBoard[fromRank][fromFile] = 0
    hypotheticalBoard[toRank][toFile] = pieceId

    // set the pawn to be a queen if promoted, will affect this node's children
    let originalPawn = parsePieceId[pieceId]
    if (originalPawn instanceof Pawn && toRank === (turn === 1 ? 0 : 7)) {
      parsePieceId[pieceId] = new Queen(turn, pieceId)
    } 

    let originalValue = value

    let rawBoardValue = minimax(hypotheticalBoard, turn * -1, depth - 1, alpha, beta, maximizingPlayer ? false : true, moveNumber + 1)

    value = maximizingPlayer ?
     Math.max(value, rawBoardValue) :
     Math.min(value, rawBoardValue)

    // revert the change and make the piece a pawn again
    parsePieceId[pieceId] = originalPawn

    // at the current decision node, update the most optimal (maximum or minimum) move
    if (depth === ENGINE_DEPTH) {
      if (optimalEngineMove[0] === -1) {
        optimalEngineMove = allMoves[i]
      }
      if (value !== originalValue) {
        optimalEngineMove = allMoves[i]
      }
    }

    if (maximizingPlayer) {
      alpha = Math.max(alpha, value)
      if (value >= beta) {
        break
      }
    } else {
      beta = Math.min(beta, value)
      if (value <= alpha) {
        break
      }
    }
  }
  return value
}


const minimaxCaptures = (board, turn, alpha, beta, maximizingPlayer, moveNumber) => {
  let captureMoves = []
  for (let i=0; i < 8; i++) {
    for (let j=0; j < 8; j++) {
      let pieceId = board[i][j]
      if (pieceId > 0) {
        let moves = possibleMoves(board, i, j, parsePieceId[pieceId], turn)
        for (let z=0; z < moves.length; z++) {
          let moveInformation = [pieceId,[i, j, moves[z][0], moves[z][1]]]
          
          // only include capture moves
          if (doesCapturePiece(board, moves[z]) || doesCapturePawn(board, moves[z])) {
            captureMoves.push(moveInformation)
          }
        }
      }
    }
  }

  if (captureMoves.length === 0) {
    return evaluate(board, moveNumber)
  }

  let value = maximizingPlayer ? -Infinity : Infinity

  for (let i=0; i < captureMoves.length; i++) {
    let hypotheticalBoard = [[],[],[],[],[],[],[],[]];
    for (let i=0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        hypotheticalBoard[i][j] = board[i][j]
      }
    }
    let [pieceId, [fromRank, fromFile, toRank, toFile]] = captureMoves[i]

    hypotheticalBoard[fromRank][fromFile] = 0
    hypotheticalBoard[toRank][toFile] = pieceId

    // set the pawn to be a queen if promoted, will affect this node's children
    let originalPawn = parsePieceId[pieceId]
    if (originalPawn instanceof Pawn && toRank === (turn === 1 ? 0 : 7)) {
      parsePieceId[pieceId] = new Queen(turn, pieceId)
    } 

    value = maximizingPlayer ?
     Math.max(value, minimaxCaptures(hypotheticalBoard, turn * -1, alpha, beta, false, moveNumber + 1)) :
     Math.min(value, minimaxCaptures(hypotheticalBoard, turn * -1, alpha, beta, true, moveNumber + 1))

    // revert the change and make the piece a pawn again
    parsePieceId[pieceId] = originalPawn


    if (maximizingPlayer) {
      alpha = Math.max(alpha, value)
      if (value >= beta) {
        break
      }
    } else {
      beta = Math.min(beta, value)
      if (value <= alpha) {
        break
      }
    }
  }
  return value
}

const checkMovesForFastestMate = (board, turn) => {
  let allMoves = []
  for (let i=0; i < 8; i++) {
    for (let j=0; j < 8; j++) {
      let pieceId = board[i][j]
      if (pieceId > 0) {
        let moves = possibleMoves(board, i, j, parsePieceId[pieceId], turn)
        for (let z=0; z < moves.length; z++) {
          let moveInformation = [pieceId,[i, j, moves[z][0], moves[z][1]]]
          
          allMoves.push(moveInformation)
        }
      }
    }
  }

  let fastestMateIn = Infinity
  let fastestMate = [-1, [0, 0, 0, 0]]

  for (let i=0; i < allMoves.length; i++) {
    let hypotheticalBoard = [[],[],[],[],[],[],[],[]];
    for (let i=0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        hypotheticalBoard[i][j] = board[i][j]
      }
    }
    let [pieceId, [fromRank, fromFile, toRank, toFile]] = allMoves[i]

    hypotheticalBoard[fromRank][fromFile] = 0
    hypotheticalBoard[toRank][toFile] = pieceId

    // set the pawn to be a queen if promoted, will affect this node's children
    let originalPawn = parsePieceId[pieceId]
    if (originalPawn instanceof Pawn && toRank === (turn === 1 ? 0 : 7)) {
      parsePieceId[pieceId] = new Queen(turn, pieceId)
    } 

    let mateIn = findFastestMate(hypotheticalBoard, turn * -1, ENGINE_DEPTH, -Infinity, Infinity, turn === -1, turn === 1 ? Infinity : -Infinity)[1]
    if (mateIn < fastestMateIn) {
      fastestMate = allMoves[i]
      fastestMateIn = mateIn
    }
    if (mateIn === 1) {
      return allMoves[i]
    }

    // revert the change and make the piece a pawn again
    parsePieceId[pieceId] = originalPawn
    
  }
  return fastestMate
}

// output = [value of position, <mate in>]
const findFastestMate = (board, turn, depth, alpha, beta, maximizingPlayer, matingValue) => {
  
  let allMoves = []
  for (let i=0; i < 8; i++) {
    for (let j=0; j < 8; j++) {
      let pieceId = board[i][j]
      if (pieceId > 0) {
        let moves = possibleMoves(board, i, j, parsePieceId[pieceId], turn)
        for (let z=0; z < moves.length; z++) {
          let moveInformation = [pieceId,[i, j, moves[z][0], moves[z][1]]]
          
          allMoves.push(moveInformation)
        }
      }
    }
  }

  if (evaluate(board, 0) === matingValue) {
    return [matingValue, 1]
  }

  if (allMoves.length === 0 || depth === 0) {
    // indicated by infinity, this path does not lead to mate and should be ignored
    return [evaluate(board, 0), Infinity]
  }


  let value = maximizingPlayer ? -Infinity : Infinity
  let mateIn = Infinity

  for (let i=0; i < allMoves.length; i++) {
    let hypotheticalBoard = [[],[],[],[],[],[],[],[]];
    for (let i=0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        hypotheticalBoard[i][j] = board[i][j]
      }
    }
    let [pieceId, [fromRank, fromFile, toRank, toFile]] = allMoves[i]

    hypotheticalBoard[fromRank][fromFile] = 0
    hypotheticalBoard[toRank][toFile] = pieceId

    // set the pawn to be a queen if promoted, will affect this node's children
    let originalPawn = parsePieceId[pieceId]
    if (originalPawn instanceof Pawn && toRank === (turn === 1 ? 0 : 7)) {
      parsePieceId[pieceId] = new Queen(turn, pieceId)
    } 

    let searchOutput = findFastestMate(hypotheticalBoard, turn * -1, depth - 1, alpha, beta, !maximizingPlayer, matingValue)

    value = maximizingPlayer ?
     Math.max(value, searchOutput[0]) :
     Math.min(value, searchOutput[0])

    mateIn = Math.min(mateIn, searchOutput[1] + 1)

    // revert the change and make the piece a pawn again
    parsePieceId[pieceId] = originalPawn

    if (maximizingPlayer) {
      alpha = Math.max(alpha, value)
      if (value > beta) {
        break
      }
    } else {
      beta = Math.min(beta, value)
      if (value < alpha) {
        break
      }
    }
  }
  return [value, mateIn]
}


const doesCapturePiece = (board, [toRank, toFile]) => {
  if (board[toRank][toFile] > 0 && parsePieceId[board[toRank][toFile]].value >= 3) {
    return true
  }
  return false
}

const doesCapturePawn = (board, [toRank, toFile]) => {
  if (board[toRank][toFile] > 0 && parsePieceId[board[toRank][toFile]].value === 3) {
    return true
  }
  return false
}


// evaluate the score for the position for WHITE
const evaluate = (board, moveNumber) => {
  if (isCheckmate(board, 1)) {return -Infinity}
  if (isCheckmate(board, -1)) {return Infinity}

  let score = 0
  let pieceCount = 0
  let whitePieceCount = 0
  let blackPieceCount = 0
  let whiteKingPosition = [0, 0]
  let blackKingPosition = [0, 0]

  // piece value, opening bonus and count number of pieces
  for (let i=0; i < 8; i++) {
    for (let j=0; j < 8; j++) {
      if (board[i][j] > 0) {
        let piece = parsePieceId[board[i][j]]

        // counting operations
        pieceCount++
        if (piece.color === 1) {whitePieceCount++}
        else {blackPieceCount++}
        if (board[i][j] === 1) {whiteKingPosition = [i, j]}
        if (board[i][j] === 17) {blackKingPosition = [i, j]}
        
        // for opening bonus, only pieces on own side of the board are considered
        score += piece.value * piece.color + 
                  piece.openingBonus[piece.color === 1 ? 7 - i : i][j] / 15 
                  * openingMoveThreshold / Math.max(openingMoveThreshold, moveNumber)
                  * piece.color
      }
    }
  }
  
  // checkmate phase: bypasses endgame bonus
  if (whitePieceCount === 1) {
    // white king is better off in the centre
    score += parsePieceId[1].endgameBonus[whiteKingPosition[0]][whiteKingPosition[1]] / 10
    // black king is better off being close to the white king
    score += Math.sqrt((whiteKingPosition[0] - blackKingPosition[0]) ** 2 + 
                (whiteKingPosition[1] - blackKingPosition[1]) ** 2) / 2

    return score
  }

  if (blackPieceCount === 1) {
    // black king is better off in the centre
    score -= parsePieceId[17].endgameBonus[blackKingPosition[0]][blackKingPosition[1]] / 10
    // white king is better off being close to the black king
    score -= Math.sqrt((whiteKingPosition[0] - blackKingPosition[0]) ** 2 + 
                (whiteKingPosition[1] - blackKingPosition[1]) ** 2) / 2

    return score
  }

  // endgame bonus
  if (pieceCount <= endgamePieceThreshold) {
    for (let i=0; i < 8; i++) {
      for (let j=0; j < 8; j++) {
        if (board[i][j] > 0) {
          let piece = parsePieceId[board[i][j]]
          // for endgame bonus, only pawns' values are directional
          if (piece instanceof Pawn) {
            score += piece.endgameBonus[piece.color === 1 ? i : 7 - i][j] / 10
          } else {
            score += piece.endgameBonus[i][j] / 10 
                    * piece.color
          }
          
        }
      }
    }
  }

  return score
}

// check if this color's king is getting mated
const isCheckmate= (board, turn) => {
  let allMoves = []
  scanningBoard:
    for (let i=0; i < 8; i++) {
      for (let j=0; j < 8; j++) {
        let pieceId = board[i][j]
        if (pieceId > 0) {
          let moves = possibleMoves(board, i, j, parsePieceId[pieceId], turn)
          if (moves.length > 0) {
            allMoves.push([pieceId, moves])
            break scanningBoard
          }
        }
      }
    }
  if (allMoves.length === 0) {
    return true
  }
  return false
}

/////////////////////////////////////////////////////////////
// Aesthetics ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////


const indicatePossibleMoves = (board, rank, file, piece, turn, status) => {

  if (status === 0) {
      let moves = possibleMoves(board, rank, file, piece, turn)

      for (let i=0; i < moves.length; i++) {
          document.getElementById(moves[i][0].toString().concat(moves[i][1].toString())).style.backgroundColor = 'red'
      }
  }
}

/////////////////////////////////////////////////////////////
// References ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////

const ENGINE_DEPTH = 4
let optimalEngineMove = [-1, [0, 0, 0, 0]]
// false if checkmate or draw is detected
let ongoingEngine = true
// considered to be in the opening before this move number
const openingMoveThreshold = 15
const endgamePieceThreshold = 20
const endgameCheckmatePieceThreshold = 5

setStartingPieces()
createBoardTemplate()

const gameState = {
  PLAYER_TURN: 0,
  WHITE_CHECKMATE: 1,
  BLACK_CHECKMATE: 2,
  BLACK_RESIGN: 3,
  WHITE_RESIGN: 4,
  STALEMATE: 5,
  INSUFFICIENT: 6,
  SELECTING: 7,
  CHOOSING: 8,
  ENGINE_TURN: 9
}
