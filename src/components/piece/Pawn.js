import Piece from './Piece'

export default class Pawn extends Piece{

    constructor(color, id) {
        super(color, id);
        this.canTakeByEnPassant = false;
        this.value = 1;
        this.openingBonus = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 2, 5, 10, 10, 5, 2, 1],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
        ];
        // perspective: white's board
        this.endgameBonus = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [9, 9, 9, 9, 9, 9, 9, 9],
            [9, 9, 9, 9, 9, 9, 9, 9],
            [4, 4, 4, 4, 4, 4, 4, 4],
            [2, 2, 2, 2, 2, 2, 2, 2],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
        ];
    }

    render() {
        if (this.color === 1) { return require('./img/wp.png'); }
        if (this.color === -1) { return require('./img/bp.png'); }
    }
}