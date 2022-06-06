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
    }

    render() {
        if (this.color === 1) {return require('./img/wn.png')}
        if (this.color === -1) {return require('./img/bn.png')}
    }
}