import Piece from './Piece'

export default class Bishop extends Piece{

    constructor(color, id, bishopColor) {
        super(color, id)
        this.bishopColor = bishopColor
        this.value = 3
    }

    render() {
        if (this.color === 1) {return require('./img/wb.png')}
        if (this.color === -1) {return require('./img/bb.png')}
    }
}