import Piece from './Piece'

export default class Pawn extends Piece{

    constructor(color, id) {
        super(color, id)
        this.canTakeByEnPassant = false
        this.value = 1
    }

    render() {
        if (this.color === 1) {return require('./img/wp.png')}
        if (this.color === -1) {return require('./img/bp.png')}
    }
}