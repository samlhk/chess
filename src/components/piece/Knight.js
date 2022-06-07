import Piece from './Piece'

export default class Knight extends Piece{
    constructor(color, id) {
        super(color, id)
        this.value = 3
        this.openingBonus = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 5, 5, 0, 0, 0],
            [0, 0, 7, 0, 0, 7, 0, 0],
            [0, 0, 0, 9, 9, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
        ]
        this.endgameBonus = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 2, 4, 4, 4, 4, 2, 0],
            [0, 2, 4, 5, 5, 4, 2, 0],
            [0, 2, 4, 5, 5, 4, 2, 0],
            [0, 2, 4, 4, 4, 4, 2, 0],
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
        ]
    }

    render() {
        if (this.color === 1) {return require('./img/wn.png')}
        if (this.color === -1) {return require('./img/bn.png')}
    }
}