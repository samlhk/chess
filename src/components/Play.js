import { useState } from 'react'
import { Link } from 'react-router-dom'
import King from './piece/King'
import Queen from './piece/Queen'
import Bishop from './piece/Bishop'
import Knight from './piece/Knight'
import Rook from './piece/Rook'
import Pawn from './piece/Pawn'
import Panel from './Panel'
import Selection from './Selection'
import { checkMovePossible, possibleMoves, handleCastling, handleEnPassant, inCheck,
 resetBoardColors, parsePieceId, setStartingPieces,
boardTemplate, createBoardTemplate,fileLegend, rankLegend, startingPosition, endGameMessages
 } from './util'

let movingPiece = '';

const Play = () => {
  const [board, updateBoard] = useState(startingPosition)

  // white: 1    black: -1
  const [turn, updateTurn] = useState(1)

  const [status, updateStatus] = useState(gameState.ONGOING)

  // color of player making the draw request
  const [drawRequested, updateDrawRequested] = useState(0)

  // [piece id, piece color]
  const [promotedPieceInfo, updatePromotedPieceInfo] = useState([0, 0])

  const [perspective, updatePerspective] = useState(1)

  // behavior when dragging over cells
  const onDragOver = (e) => {
    e.preventDefault()
  }
  
  // record the identity of the piece
  const onDragStart = (pieceId) => {
    movingPiece = pieceId;
  }
  
  // behavior when dropped onto final cell
  const drop = (toCellId) => {
    // e.preventDefault()
    resetBoardColors()

    let pieceId = parseInt(movingPiece);

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
    if (status === gameState.ONGOING && checkMovePossible(currentBoardInfo)) {

        handleEnPassant(currentBoardInfo)

        // make the move on the board
        newBoard[fromRank][fromFile] = 0
        newBoard[toRank][toFile] = pieceId

        handlePromotion(pieceId, toRank)
        handleCastling(piece, newBoard, toRank, toFile)

        resetDrawRequest()

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
      }
      else {
        updateStatus(gameState.STALEMATE)
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
      return
    }
    // King + minor v King
    if ((whiteMinorCount === 0 && blackMinorCount === 1) || (whiteMinorCount === 1 && blackMinorCount === 0)){
      updateStatus(gameState.INSUFFICIENT)
      return
    }
    // King + Bishop v King + Bishop (same color)
    if (whiteBishopCount === 1 && blackBishopCount === 1) {
      if (whiteBishop.bishopColor === blackBishop.bishopColor) {
        updateStatus(gameState.INSUFFICIENT)
        return
      }
    }

  }

  const onResign = () => {
    updateStatus(turn === 1 ? gameState.WHITE_RESIGN : gameState.BLACK_RESIGN)
  }

  const onDraw = () => {
    if (drawRequested === turn * -1) {
      updateStatus(gameState.AGREEMENT)
    } else if (drawRequested === 0) {
      updateDrawRequested(turn)
    }
  }

  const resetDrawRequest = () => {
    if (drawRequested === turn * -1) {
      updateDrawRequested(0)
    }
  }

  // prompt the player to choose the promoted piece if needed
  const handlePromotion = (pieceId, toRank) => {
    let piece = parsePieceId[pieceId]
    if (piece instanceof Pawn) {
      if (toRank === (piece.color === 1 ? 0 : 7)) {
        updateStatus(gameState.SELECTING)
        updatePromotedPieceInfo([pieceId, piece.color])
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
    updateStatus(gameState.ONGOING)
    checkCheckmate(board, turn)
  }


  const resetBoard = () => {
    setStartingPieces()
    updateBoard(startingPosition)
    updateTurn(1)
    updateStatus(gameState.ONGOING)
    updateDrawRequested(0)
    updatePromotedPieceInfo([0, 0])
  }


  const flipBoard = () => {
    updatePerspective(perspective * -1)
    rankLegend.reverse()
    fileLegend.reverse()
  }

  return (
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
                onDragOver={(e) => {onDragOver(e)}} onDrop={(e) => {drop(cellId)}} >

                  {(() => {
                    let pieceId = board[parseInt(cellId[0])][parseInt(cellId[1])]
                  if (pieceId > 0) {return (
                  <img src={parsePieceId[pieceId].render()}  alt=''
                    draggable onDragStart={(e) => {onDragStart(pieceId); indicatePossibleMoves(board, 
                      parseInt(cellId[0]), parseInt(cellId[1]), parsePieceId[pieceId], turn, status)}}
                    onDragEnd={resetBoardColors} />)}}
                    )()}

              </div>)})}

          </div>
        </div>
      </div>

      <div id='panel'>
        <Link to='/'>
            <button className='btn btn-block btn-secondary'>Home</button>
        </Link><br/>
        <div>
          {(() => {
              switch(status) {
                case gameState.ONGOING:
                  return (<Panel turn={turn} onResign={onResign}
                    drawRequested={drawRequested} onDraw={onDraw}/>)
                case gameState.SELECTING:
                  return (<Selection turn={turn * -1} onResolve={resolvePromotion} />)
                default:
                  return (<div id='end-game'>
                            <div>{endGameMessages[status]}</div>
                            <button className='board-control-btn' onClick={resetBoard}>
                              <i className='fa fa-refresh' />
                            </button>
                          </div>)
              }
          })()}
          <button className='board-control-btn' onClick={flipBoard}>
            <i className='fa fa-exchange fa-3x fa-rotate-90'/>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Play

/////////////////////////////////////////////////////////////
// Aesthetics ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////


const indicatePossibleMoves = (board, rank, file, piece, turn, status) => {

  if (status === gameState.ONGOING) {
      let moves = possibleMoves(board, rank, file, piece, turn)

      for (let i=0; i < moves.length; i++) {
          document.getElementById(moves[i][0].toString().concat(moves[i][1].toString())).style.backgroundColor = 'red'
      }
  }
}

/////////////////////////////////////////////////////////////
// References ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////

setStartingPieces()
createBoardTemplate()

const gameState = {
  ONGOING: 0,
  WHITE_CHECKMATE: 1,
  BLACK_CHECKMATE: 2,
  BLACK_RESIGN: 3,
  WHITE_RESIGN: 4,
  STALEMATE: 5,
  AGREEMENT: 6,
  INSUFFICIENT: 7,
  SELECTING: 8
}
