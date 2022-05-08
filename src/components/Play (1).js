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

function allowDrop(e) {
  e.preventDefault();
}

function drag(e) {
  e.dataTransfer.setData('piece-id', e.target.id);
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

  const drop = (e, toCellId) => {
    e.preventDefault();
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
    
    // check if the move is plainly legal
    let currentBoardInfo = {
      'board': newBoard,
      'fromRank': fromCellId[0],
      'fromFile': fromCellId[1],
      'toRank': parseInt(toCellId[0]),
      'toFile': parseInt(toCellId[1]),
      'piece': parsePieceId[pieceId],
    }
    if (parsePieceId[pieceId].color === turn && moveValid(currentBoardInfo)) {
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
                  <img id={pieceId}  alt=''
                    draggable src={parsePieceId[pieceId].render()} onDragStart={(e) => {drag(e)}}/>)}}
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

const moveValid = (currentBoardInfo) => {

  if (currentBoardInfo.piece instanceof King) {return validateKing(currentBoardInfo)}
  if (currentBoardInfo.piece instanceof Queen) {return validateQueen(currentBoardInfo)}
  if (currentBoardInfo.piece instanceof Rook) {return validateRook(currentBoardInfo)}
  if (currentBoardInfo.piece instanceof Bishop) {return validateBishop(currentBoardInfo)}
  if (currentBoardInfo.piece instanceof Knight) {return validateKnight(currentBoardInfo)}
  if (currentBoardInfo.piece instanceof Pawn) {return validatePawn(currentBoardInfo)}

  
  return false
}


const validateKing = ({ board, fromRank, fromFile, toRank, toFile, piece }) => {

  let horizontal = Math.abs(fromFile - toFile)
  let vertical = Math.abs(fromRank - toRank)
  if ((horizontal === 1 && vertical === 1) ||
     (horizontal === 0 && vertical === 1) ||
     (horizontal === 1 && vertical === 0)) {
       if (board[toRank][toFile] === 0 || parsePieceId[board[toRank][toFile]].color === (-1 * piece.color)) {
         return true
       }
     }

  return false
}


const validateKnight = ({ board, fromRank, fromFile, toRank, toFile, piece }) => {

  let horizontal = Math.abs(fromFile - toFile)
  let vertical = Math.abs(fromRank - toRank)
  if ((horizontal === 1 && vertical === 2) ||
      (horizontal === 2 && vertical === 1)) {
        if (board[toRank][toFile] === 0 || parsePieceId[board[toRank][toFile]].color === (-1 * piece.color)) {
          return true
        }
      }
  
  return false
}


const validatePawn = ({ board, fromRank, fromFile, toRank, toFile, piece }) => {

  // normal movement
  if (fromFile === toFile && board[toRank][toFile] === 0) {

    // one cell jump
    if ((fromRank - toRank) === piece.color) {
      return true
    }
    
    // initial two cell jump
    if ((fromRank - toRank) === (2 * piece.color) && fromRank === (piece.color === 1 ? 6 : 1)) {
      return true
    }
  }

  // capture movement
  if (Math.abs(fromFile - toFile) === 1 && (fromRank - toRank) === piece.color) {
    if (board[toRank][toFile] > 0 && parsePieceId[board[toRank][toFile]].color === (-1 * piece.color)) {
      return true
    }
  }
  
  return false
}


const validateRook = ({ board, fromRank, fromFile, toRank, toFile, piece }) => {
  // horizontal movement
  if (fromRank === toRank) {
    for (let file = Math.min(fromFile, toFile) + 1; file < Math.max(fromFile, toFile); file++) {
      if (board[fromRank][file] > 0) {
        return false
      }
    }

    if (board[toRank][toFile] === 0 || parsePieceId[board[toRank][toFile]].color === (-1 * piece.color)) {
         return true
       }
  }

  // vertical movement
  if (fromFile === toFile) {
    for (let rank = Math.min(toRank, toRank) + 1; rank < Math.max(fromRank, toRank); rank++) {
      if (board[rank][fromFile] > 0) {
        return false
      }
    }

    if (board[toRank][toFile] === 0 || parsePieceId[board[toRank][toFile]].color === (-1 * piece.color)) {
         return true
       }
  }
  
  return false
}


const validateBishop = ({ board, fromRank, fromFile, toRank, toFile, piece }) => {

  let rankOffset = toRank - fromRank
  let fileOffset = toFile - fromFile

  if (Math.abs(rankOffset) === Math.abs(fileOffset)) {
    
    // check for obstacles in the way
    let rank = fromRank
    let file = fromFile
    let rankDirection = rankOffset > 0 ? 1 : -1
    let fileDirection = fileOffset > 0 ? 1 : -1
    for (let i = 0; i < Math.abs(rankOffset) - 1; i++) {
      rank += rankDirection
      file += fileDirection
      if (board[rank][file] > 0) {
        return false
      }
    }

    if (board[toRank][toFile] === 0 || parsePieceId[board[toRank][toFile]].color === (-1 * piece.color)) {
      return true
    }
  }

  return false
}


const validateQueen = (currentBoardInfo) => {
  return validateRook(currentBoardInfo) || validateBishop(currentBoardInfo)
}


// check if the color's king is in check
const inCheck = ({ board, color }) => {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      
    }
  }

  return false
}


/////////////////////////////////////////////////////////////
// References ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////

// find a better way to do this
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