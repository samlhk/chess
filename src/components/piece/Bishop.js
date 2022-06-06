import Piece from './Piece'

export default class Bishop extends Piece{

    constructor(color, id, bishopColor) {
        super(color, id)
        this.bishopColor = bishopColor
        this.value = 3
        this.openingBonus = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 6, 0, 0, 0, 0, 6, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 4, 7, 9, 9, 7, 4, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
        ]
    }

    render() {
        if (this.color === 1) {return require('./img/wb.png')}
        if (this.color === -1) {return require('./img/bb.png')}
    }
}