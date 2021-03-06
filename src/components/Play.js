import { useState } from 'react'
import King from './piece/King'
import Queen from './piece/Queen'
import Bishop from './piece/Bishop'
import Knight from './piece/Knight'
import Rook from './piece/Rook'
import Pawn from './piece/Pawn'
import Panel from './Panel'
import Selection from './Selection'

const Play = () => {
  const [board, updateBoard] = useState(startingPosition)

  // white: 1    black: -1
  const [turn, updateTurn] = useState(1)

  const [status, updateStatus] = useState(ONGOING)

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
  const onDragStart = (e, pieceId) => {
    e.dataTransfer.setData('piece-id', pieceId)
  }
  
  // behavior when dropped onto final cell
  const drop = (e, toCellId) => {
    e.preventDefault()
    resetBoardColors()

    let pieceId = parseInt(e.dataTransfer.getData('piece-id'));

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
    if (status === ONGOING && checkMovePossible(currentBoardInfo)) {

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
        updateStatus(turn === 1 ? BLACK_CHECKMATE : WHITE_CHECKMATE)
      }
      else {
        updateStatus(STALEMATE)
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
      updateStatus(INSUFFICIENT)
      return
    }
    // King + minor v King
    if ((whiteMinorCount === 0 && blackMinorCount === 1) || (whiteMinorCount === 1 && blackMinorCount === 0)){
      updateStatus(INSUFFICIENT)
      return
    }
    // King + Bishop v King + Bishop (same color)
    if (whiteBishopCount === 1 && blackBishopCount === 1) {
      if (whiteBishop.bishopColor === blackBishop.bishopColor) {
        updateStatus(INSUFFICIENT)
        return
      }
    }

  }

  const onResign = () => {
    updateStatus(turn === 1 ? WHITE_RESIGN : BLACK_RESIGN)
  }

  const onDraw = () => {
    if (drawRequested === turn * -1) {
      updateStatus(AGREEMENT)
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
        updateStatus(SELECTING)
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
    updateStatus(ONGOING)
    checkCheckmate(board, turn)
  }


  const resetBoard = () => {
    setStartingPieces()
    updateBoard(startingPosition)
    updateTurn(1)
    updateStatus(ONGOING)
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
                onDragOver={(e) => {onDragOver(e)}} onDrop={(e) => {drop(e, cellId)}} >

                  {(() => {
                    let pieceId = board[parseInt(cellId[0])][parseInt(cellId[1])]
                  if (pieceId > 0) {return (
                  <img src={parsePieceId[pieceId].render()}  alt=''
                    draggable onDragStart={(e) => {onDragStart(e, pieceId); indicatePossibleMoves(board, 
                      parseInt(cellId[0]), parseInt(cellId[1]), parsePieceId[pieceId], turn, status)}}
                    onDragEnd={resetBoardColors} />)}}
                    )()}

              </div>)})}

          </div>
        </div>
      </div>

      <div id='panel'>
        <div>
          {(() => {
              switch(status) {
                case ONGOING:
                  return (<Panel turn={turn} onResign={onResign}
                    drawRequested={drawRequested} onDraw={onDraw}/>)
                case SELECTING:
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
// Logic ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

const checkMovePossible = ({ board, fromRank, fromFile, toRank, toFile, piece, turn }) => {

  let moves = possibleMoves(board, fromRank, fromFile, piece, turn)

  for (let i = 0; i < moves.length; i++) {
    if (moves[i][0] === toRank && moves[i][1] === toFile) {
      return true
    }
  }
  return false
}

const possibleMoves = (board, rank, file, piece, turn) => {

  let possibleMoves = []

  // only show available moves for current player
  if (piece.color !== turn) {return possibleMoves}

  let moves = sensibleMoves(board, rank, file, piece)

  for (let i=0; i < moves.length; i++) {

    let hypotheticalBoard = [[],[],[],[],[],[],[],[]];
    for (let i=0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        hypotheticalBoard[i][j] = board[i][j]
      }
    }
    let toRank = parseInt(moves[i][0])
    let toFile = parseInt(moves[i][1])

    hypotheticalBoard[rank][file] = 0
    hypotheticalBoard[toRank][toFile] = parseInt(piece.id)

    // take the en passant pawn
    if (piece instanceof Pawn) {
      if (rank - piece.color === toRank
         && (file - 1 === toFile || file + 1 === toFile)
         && board[toRank][toFile] === 0) {
        hypotheticalBoard[rank][toFile] = 0
      }
    }

    if (!inCheck({'board': hypotheticalBoard, 'color': turn})) {
      possibleMoves.push(moves[i])
    }
  }
  return possibleMoves
}


// does not consider checks
const checkMoveSensible = ({ board, fromRank, fromFile, toRank, toFile, piece, ignoreCastling }) => {
  
  let moves = sensibleMoves(board, fromRank, fromFile, piece, ignoreCastling)

  for (let i = 0; i < moves.length; i++) {
    if (moves[i][0] === toRank && moves[i][1] === toFile) {
      return true
    }
  }
  return false
}


const sensibleMoves = (board, fromRank, fromFile, piece, ignoreCastling) => {
  if (piece instanceof King) {return sensibleKingMoves(board, fromRank, fromFile, piece, ignoreCastling)}
  if (piece instanceof Queen) {return sensibleQueenMoves(board, fromRank, fromFile, piece)}
  if (piece instanceof Rook) {return sensibleRookMoves(board, fromRank, fromFile, piece)}
  if (piece instanceof Bishop) {return sensibleBishopMoves(board, fromRank, fromFile, piece)}
  if (piece instanceof Knight) {return sensibleKnightMoves(board, fromRank, fromFile, piece)}
  if (piece instanceof Pawn) {return sensiblePawnMoves(board, fromRank, fromFile, piece)}
}


const sensibleKingMoves = (board, fromRank, fromFile, piece, ignoreCastling = false) => {
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

  if (!ignoreCastling) {  
    moves = moves.concat(castlingMoves(board, piece))
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

  // en passant
  let leftPiece = parsePieceId[board[fromRank][fromFile - 1]]
  let rightPiece = parsePieceId[board[fromRank][fromFile + 1]]
  if (leftPiece instanceof Pawn && leftPiece.canTakeByEnPassant) {
    moves.push([fromRank - piece.color, fromFile - 1])
  }
  if (rightPiece instanceof Pawn && rightPiece.canTakeByEnPassant) {
    moves.push([fromRank - piece.color, fromFile + 1])
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


const handleCastling = (piece, board, toRank, toFile) => {
  if (piece instanceof King || piece instanceof Rook) {
    piece.haveMoved = true
  }

  if (piece instanceof King && piece.shortCastlingApproved) {
    let baseRank = piece.color === 1 ? 7 : 0
    if (toRank === baseRank && toFile === 6) {
      // move the appropriate rook
      board[baseRank][7] = 0
      board[baseRank][5] = piece.color === 1 ? 4 : 20
    }
  }

  if (piece instanceof King && piece.longCastlingApproved) {
    let baseRank = piece.color === 1 ? 7 : 0
    if (toRank === baseRank && toFile === 2) {
      // move the appropriate rook
      board[baseRank][0] = 0
      board[baseRank][3] = piece.color === 1 ? 3 : 19
    }
  }

  piece.shortCastlingApproved = false
  piece.longCastlingApproved = false

  return board
}


const handleEnPassant = ({ board, fromRank, fromFile, toRank, toFile, piece }) => {
  // taken by en passant
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let scanningPiece = parsePieceId[board[i][j]]
      if (scanningPiece instanceof Pawn) {
        scanningPiece.canTakeByEnPassant = false
      }
    }
  }

  if (piece instanceof Pawn) {
    if (fromRank === (piece.color === 1 ? 6 : 1) && toRank === (piece.color === 1 ? 4: 3)) {
      piece.canTakeByEnPassant = true
    }
  }

  // takes en passant
  if (piece instanceof Pawn) {
    if (fromRank - piece.color === toRank
       && (fromFile - 1 === toFile || fromFile + 1 === toFile)
       && board[toRank][toFile] === 0) {
      board[fromRank][toFile] = 0
    }
  }
}


const castlingMoves = (board, piece) => {
  let moves = []
  let baseRank = piece.color === 1 ? 7 : 0
  let shortRook = parsePieceId[board[baseRank][7]]
  let longRook = parsePieceId[board[baseRank][0]]
  let castlingRights = true

  // short castling
  if (!piece.haveMoved && shortRook instanceof Rook && !shortRook.haveMoved) {
    if (board[baseRank][5] === 0 && board[baseRank][6] === 0) {

        for (let file = 4; file <= 6; file++) {

          let hypotheticalBoard = [[],[],[],[],[],[],[],[]];
          for (let i=0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
              hypotheticalBoard[i][j] = board[i][j]
            }
          }
          hypotheticalBoard[baseRank][4] = 0
          hypotheticalBoard[baseRank][file] = parseInt(piece.id)
          
          if (inCheck({'board': hypotheticalBoard, 'color': piece.color, 'ignoreCastling': true})) {
            castlingRights = false
            break
          } 
        }
        if (castlingRights) {
          moves.push([baseRank, 6])
          piece.shortCastlingApproved = true
        }
        
        
    }
  }

  // long castling
  if (!piece.haveMoved && longRook instanceof Rook && !longRook.haveMoved) {
    if (board[baseRank][1] === 0 && board[baseRank][2] === 0 && board[baseRank][3] === 0) {

        for (let file = 2; file <= 4; file++) {

          let hypotheticalBoard = [[],[],[],[],[],[],[],[]];
          for (let i=0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
              hypotheticalBoard[i][j] = board[i][j]
            }
          }
          hypotheticalBoard[baseRank][4] = 0
          hypotheticalBoard[baseRank][file] = parseInt(piece.id)
          
          if (inCheck({'board': hypotheticalBoard, 'color': piece.color, 'ignoreCastling': true})) {
            castlingRights = false
            break
          } 
        }
        if (castlingRights) {
          moves.push([baseRank, 2])
          piece.longCastlingApproved = true
        }
        
        
    }
  }

  return moves
}

// check if the color's king is in check
const inCheck = ({ board, color }) => {

  // find the position of the king
  let kingId = color === 1 ? 1 : 17
  let kingRank = -1
  let kingFile = -1
  scanningBoard: 
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        if (board[rank][file] === kingId) {
          kingRank = rank
          kingFile = file
          break scanningBoard
        }
      }
    }

  // check all enemy pieces to see if they can attack my king
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      let piece = parsePieceId[board[rank][file]]
      if (piece && piece.color === (-1 * color)) {
        if (checkMoveSensible({'board': board, 'fromRank': rank, 'fromFile': file,
          'toRank': kingRank, 'toFile': kingFile, 'piece': piece, 'ignoreCastling': true})) {
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


const indicatePossibleMoves = (board, rank, file, piece, turn, status) => {

  if (status === ONGOING) {
    let moves = possibleMoves(board, rank, file, piece, turn)

    for (let i=0; i < moves.length; i++) {
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

let wk, wq, wr1, wr2, wb1, wb2, wn1, wn2, wp1, wp2, wp3, wp4, wp5, wp6, wp7, wp8;
let bk, bq, br1, br2, bb1, bb2, bn1, bn2, bp1, bp2, bp3, bp4, bp5, bp6, bp7, bp8;
let parsePieceId;

const setStartingPieces = () => {
  wk = new King(1, 1)
  wq = new Queen(1, 2)
  wr1 = new Rook(1, 3)
  wr2 = new Rook(1, 4)
  wb1 = new Bishop(1, 5, -1)
  wb2 = new Bishop(1, 6, 1)
  wn1 = new Knight(1, 7)
  wn2 = new Knight(1, 8)
  wp1 = new Pawn(1, 9)
  wp2 = new Pawn(1, 10)
  wp3 = new Pawn(1, 11)
  wp4 = new Pawn(1, 12)
  wp5 = new Pawn(1, 13)
  wp6 = new Pawn(1, 14)
  wp7 = new Pawn(1, 15)
  wp8 = new Pawn(1, 16)

  bk = new King(-1, 17)
  bq = new Queen(-1, 18)
  br1 = new Rook(-1, 19)
  br2 = new Rook(-1, 20)
  bb1 = new Bishop(-1, 21, 1)
  bb2 = new Bishop(-1, 22, -1)
  bn1 = new Knight(-1, 23)
  bn2 = new Knight(-1, 24)
  bp1 = new Pawn(-1, 25)
  bp2 = new Pawn(-1, 26)
  bp3 = new Pawn(-1, 27)
  bp4 = new Pawn(-1, 28)
  bp5 = new Pawn(-1, 29)
  bp6 = new Pawn(-1, 30)
  bp7 = new Pawn(-1, 31)
  bp8 = new Pawn(-1, 32)

  parsePieceId = [
    , wk, wq, wr1, wr2, wb1, wb2, wn1, wn2, wp1, wp2, wp3, wp4, wp5, wp6, wp7, wp8,
    bk, bq, br1, br2, bb1, bb2, bn1, bn2, bp1, bp2, bp3, bp4, bp5, bp6, bp7, bp8
  ]
}

setStartingPieces()


let boardTemplate = []
for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    boardTemplate.push({
      'id': i.toString().concat(j.toString()),
      'isWhite': (i + j) % 2 === 0 ? true : false,
    })
  }
}

const fileLegend = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const rankLegend = ['8', '7', '6', '5', '4', '3', '2', '1']

const startingPosition = [
  [19, 23, 21, 18, 17, 22, 24, 20],
  [25, 26, 27, 28, 29, 30, 31, 32],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [9, 10, 11, 12, 13, 14, 15, 16],
  [3, 7, 5, 2, 1, 6, 8, 4]
]

const endGameMessages = [
  , 'Checkmate, White Win',
  'Checkmate, Black Win',
  'Black Resigns, White Win',
  'White Resigns, Black Win',
  'Draw by Stalemate',
  'Draw by Agreement',
  'Draw by Insufficient Material',
]

const ONGOING = 0
const WHITE_CHECKMATE = 1
const BLACK_CHECKMATE = 2
const BLACK_RESIGN = 3
const WHITE_RESIGN = 4
const STALEMATE = 5
const AGREEMENT = 6
const INSUFFICIENT = 7
const SELECTING = 8
