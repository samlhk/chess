import { useState } from 'react'
import King from './piece/King'
import Queen from './piece/Queen'
import Bishop from './piece/Bishop'
import Knight from './piece/Knight'
import Rook from './piece/Rook'
import Pawn from './piece/Pawn'

let template = []
for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    template.push({
      'id': i.toString().concat(j.toString()),
      'isWhite': (i + j) % 2 === 0 ? true : false,
    })
  }
}


const Play = () => {
  const [board, updateBoard] = useState([
    [19, 23, 21, 18, 17, 22, 24, 20],
    [25, 26, 27, 28, 29, 30, 31, 32],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [9, 10, 11, 12, 13, 14, 15, 16],
    [3, 7, 5, 2, 1, 6, 8, 4]
  ])

  const [turn, updateTurn] = useState(1)

  const allowDrop = (e) => {
    e.preventDefault();
  }
  
  const drag = (e, pieceId) => {
    e.dataTransfer.setData('piece-id', pieceId);
  }
  
  const drop = (e, toCellId) => {
    e.preventDefault();
    resetBoardColors()
    let pieceId = e.dataTransfer.getData('piece-id');

    let newBoard = [[],[],[],[],[],[],[],[]];
    for (let i=0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        newBoard[i][j] = board[i][j]
      }
    }

    let fromCellId = [-1, -1]
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (newBoard[i][j] === parseInt(pieceId)) {fromCellId = [i, j]}
      }
    }
    
    // check if the move is legal
    let currentBoardInfo = {
      'board': newBoard,
      'fromRank': fromCellId[0],
      'fromFile': fromCellId[1],
      'toRank': parseInt(toCellId[0]),
      'toFile': parseInt(toCellId[1]),
      'piece': parsePieceId[pieceId],
    }
    // todo: merge incheck into sensible
    if (parsePieceId[pieceId].color === turn && checkMoveSensible(currentBoardInfo)) {
      newBoard[fromCellId[0]][fromCellId[1]] = 0
      newBoard[parseInt(toCellId[0])][parseInt(toCellId[1])] = parseInt(pieceId)

      // check if the move will put yourself in check
      if (inCheck({'board': newBoard, 'color': turn})) {
        newBoard = board
      } else {
        updateTurn(turn * -1)
      }

    }
    updateBoard(newBoard)
  }

  return (
    <div id='play-wrapper'>
      <div id='play-area'>
        <div id='side-legend'>
          <div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div>
        </div>
        <div>
          <div id='top-legend'>
            <div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div>
          </div>
          <div id='board'>
          {template.map((cell) => (

              <div className={`cell ${cell.isWhite ? 'white-cell' : 'black-cell'} `} id={cell.id} key={cell.id}
                onDragOver={(e) => {allowDrop(e)}} onDrop={(e) => {drop(e, cell.id)}} >

                  {(() => {
                    let pieceId = board[parseInt(cell.id[0])][parseInt(cell.id[1])]
                  if (pieceId > 0) {return (
                  <img src={parsePieceId[pieceId].render()}  alt=''
                    draggable onDragStart={(e) => {drag(e, pieceId)}} 
                    onDrag={() => {indicatePossibleMoves(board, 
                      parseInt(cell.id[0]), parseInt(cell.id[1]), parsePieceId[pieceId], turn)}}
                    onDragEnd={resetBoardColors} />)}}
                    )()}

              </div>

          ))}

          </div>
        </div>
      </div>

      <div id='panel'>
        <div id='turn-indicator'>
          {turn > 0 ? <div>White</div> : <div>Black</div>}
        </div>
      </div>
    </div>
  )
}

export default Play

/////////////////////////////////////////////////////////////
// Logic ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

const checkMoveSensible = ({ board, fromRank, fromFile, toRank, toFile, piece }) => {
  
  let moves = sensibleMoves(board, fromRank, fromFile, piece)

  // todo: functional programming
  for (let i = 0; i < moves.length; i++) {
    if (moves[i][0] === toRank && moves[i][1] === toFile) {
      return true
    }
  }
  return false
}


const sensibleMoves = (board, fromRank, fromFile, piece) => {
  if (piece instanceof King) {return sensibleKingMoves(board, fromRank, fromFile, piece)}
  if (piece instanceof Queen) {return sensibleQueenMoves(board, fromRank, fromFile, piece)}
  if (piece instanceof Rook) {return sensibleRookMoves(board, fromRank, fromFile, piece)}
  if (piece instanceof Bishop) {return sensibleBishopMoves(board, fromRank, fromFile, piece)}
  if (piece instanceof Knight) {return sensibleKnightMoves(board, fromRank, fromFile, piece)}
  if (piece instanceof Pawn) {return sensiblePawnMoves(board, fromRank, fromFile, piece)}
}


const sensibleKingMoves = (board, fromRank, fromFile, piece) => {
  let moves = []
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let destinationRank = fromRank + i
      let destinationFile = fromFile + j
        if (canLandOn(board, destinationRank, destinationFile, piece)) {
          moves.push([destinationRank, destinationFile])
        }
    }
  }
  return moves
}


const sensibleKnightMoves = (board, fromRank, fromFile, piece) => {
  let moves = []
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {

      if (i !== 0 && j !== 0 && Math.abs(i) !== Math.abs(j)) {
        let destinationRank = fromRank + i
        let destinationFile = fromFile + j

        if (canLandOn(board, destinationRank, destinationFile, piece)) {
          moves.push([destinationRank, destinationFile])
        }
      }
    }
  }
  return moves
}


const sensiblePawnMoves = (board, fromRank, fromFile, piece) => {
  let moves = []

  // normal movement
  if (canLandOn(board, fromRank - piece.color, fromFile, piece, true)) {
    moves.push([fromRank - piece.color, fromFile])
  }

  // initial two jump movement
  if (fromRank === (piece.color === 1 ? 6 : 1) && canLandOn(board, fromRank - piece.color, fromFile, piece, true)
      && canLandOn(board, fromRank - 2 * piece.color, fromFile, piece, true)) {
    moves.push([fromRank - 2 * piece.color, fromFile])
  }

  // captures
  if (canLandOn(board, fromRank - piece.color, fromFile + 1, piece, false, true)) {
    moves.push([fromRank - piece.color, fromFile + 1])
  }
  if (canLandOn(board, fromRank - piece.color, fromFile - 1, piece, false, true)) {
    moves.push([fromRank - piece.color, fromFile - 1])
  }

  return moves
}


const sensibleRookMoves = (board, fromRank, fromFile, piece) => {
  let moves = []
  
  // scan four directions
  let rank = fromRank
  let file = fromFile
  while (canLandOn(board, rank + 1, file, piece)) {
    moves.push([rank + 1, file])
    if (board[rank + 1][file] === 0) {rank += 1}
    else {break}
  }
  rank = fromRank
  file = fromFile
  while (canLandOn(board, rank - 1, file, piece)) {
    moves.push([rank - 1, file])
    if (board[rank - 1][file] === 0) {rank -= 1}
    else {break}
  }
  rank = fromRank
  file = fromFile
  while (canLandOn(board, rank, file + 1, piece)) {
    moves.push([rank, file + 1])
    if (board[rank][file + 1] === 0) {file += 1}
    else {break}
  }
  rank = fromRank
  file = fromFile
  while (canLandOn(board, rank, file - 1, piece)) {
    moves.push([rank, file - 1])
    if (board[rank][file - 1] === 0) {file -= 1}
    else {break}
  }

  return moves
}


const sensibleBishopMoves = (board, fromRank, fromFile, piece) => {
  let moves = []

  // scan four directions
  let rank = fromRank
  let file = fromFile
  while (canLandOn(board, rank + 1, file + 1, piece)) {
    moves.push([rank + 1, file + 1])
    if (board[rank + 1][file + 1] === 0) {rank += 1; file += 1;}
    else {break}
  }
  rank = fromRank
  file = fromFile
  while (canLandOn(board, rank - 1, file - 1, piece)) {
    moves.push([rank - 1, file - 1])
    if (board[rank - 1][file - 1] === 0) {rank -= 1; file -= 1;}
    else {break}
  }
  rank = fromRank
  file = fromFile
  while (canLandOn(board, rank - 1, file + 1, piece)) {
    moves.push([rank - 1, file + 1])
    if (board[rank - 1][file + 1] === 0) {rank -= 1; file += 1;}
    else {break}
  }
  rank = fromRank
  file = fromFile
  while (canLandOn(board, rank + 1, file - 1, piece)) {
    moves.push([rank + 1, file - 1])
    if (board[rank + 1][file - 1] === 0) {rank += 1; file -= 1;}
    else {break}
  }

  return moves
}


const sensibleQueenMoves = (board, fromRank, fromFile, piece) => {
  return sensibleRookMoves(board, fromRank, fromFile, piece)
        .concat(sensibleBishopMoves(board, fromRank, fromFile, piece))
}


// check if the color's king is in check
const inCheck = ({ board, color }) => {

  // find the position of the king
  let kingId = color === 1 ? 1 : 17
  let kingRank = -1
  let kingFile = -1
  kingSearch: {
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        if (board[rank][file] === kingId) {
          kingRank = rank
          kingFile = file
          break kingSearch
        }
      }
    }
  }

  // check all enemy pieces to see if they can attack my king
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      let piece = parsePieceId[board[rank][file]]
      if (piece && piece.color === (-1 * color)) {
        if (checkMoveSensible({'board': board, 'fromRank': rank, 'fromFile': file,
          'toRank': kingRank, 'toFile': kingFile, 'piece': piece})) {
            return true
          }        
      }
    }
  }

  return false
}


const canLandOn = (board, rank, file, piece, pawnMove, pawnTake) => {
  if (0 <= rank && rank < 8 && 0 <= file && file < 8) {

    if (pawnMove) {
      if (board[rank][file] === 0) {return true}
      else {return false}
    }

    if (pawnTake) {
      if (board[rank][file] > 0 && parsePieceId[board[rank][file]].color === (-1 * piece.color)) {
        return true
      } else {
        return false
      }
    }

    if (board[rank][file] === 0 || parsePieceId[board[rank][file]].color === (-1 * piece.color)) {
      return true
    }
  }
  return false
}

/////////////////////////////////////////////////////////////
// Aesthetics ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////


const indicatePossibleMoves = (board, rank, file, piece, turn) => {

  // only show available moves for current player
  if (piece.color !== turn) {return}

  let moves = sensibleMoves(board, rank, file, piece)

  // todo: functional programming
  for (let i=0; i < moves.length; i++) {

    let hypotheticalBoard = [[],[],[],[],[],[],[],[]];
    for (let i=0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        hypotheticalBoard[i][j] = board[i][j]
      }
    }
    hypotheticalBoard[rank][file] = 0
    hypotheticalBoard[parseInt(moves[i][0])][parseInt(moves[i][1])] = parseInt(piece.id)

    if (!inCheck({'board': hypotheticalBoard, 'color': turn})) {
      document.getElementById(moves[i][0].toString().concat(moves[i][1].toString())).style.backgroundColor = 'red'
    }
  }
}

const resetBoardColors = () => {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let id = i.toString().concat(j.toString())
      document.getElementById(id).style.backgroundColor = (i + j) % 2 === 0 ? '#DFC9CA' : '#2B414D'
    }
  }
}


/////////////////////////////////////////////////////////////
// References ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////

// todo: find a better way to do this
const wk = new King(1, 1)
const wq = new Queen(1, 2)
const wr1 = new Rook(1, 3)
const wr2 = new Rook(1, 4)
const wb1 = new Bishop(1, 5)
const wb2 = new Bishop(1, 6)
const wn1 = new Knight(1, 7)
const wn2 = new Knight(1, 8)
const wp1 = new Pawn(1, 9)
const wp2 = new Pawn(1, 10)
const wp3 = new Pawn(1, 11)
const wp4 = new Pawn(1, 12)
const wp5 = new Pawn(1, 13)
const wp6 = new Pawn(1, 14)
const wp7 = new Pawn(1, 15)
const wp8 = new Pawn(1, 16)

const bk = new King(-1, 17)
const bq = new Queen(-1, 18)
const br1 = new Rook(-1, 19)
const br2 = new Rook(-1, 20)
const bb1 = new Bishop(-1, 21)
const bb2 = new Bishop(-1, 22)
const bn1 = new Knight(-1, 23)
const bn2 = new Knight(-1, 24)
const bp1 = new Pawn(-1, 25)
const bp2 = new Pawn(-1, 26)
const bp3 = new Pawn(-1, 27)
const bp4 = new Pawn(-1, 28)
const bp5 = new Pawn(-1, 29)
const bp6 = new Pawn(-1, 30)
const bp7 = new Pawn(-1, 31)
const bp8 = new Pawn(-1, 32)

const parsePieceId = [
  , wk, wq, wr1, wr2, wb1, wb2, wn1, wn2, wp1, wp2, wp3, wp4, wp5, wp6, wp7, wp8,
  bk, bq, br1, br2, bb1, bb2, bn1, bn2, bp1, bp2, bp3, bp4, bp5, bp6, bp7, bp8
]