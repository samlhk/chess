import Piece from './Piece';

export default class King extends Piece{

    constructor(color, id) {
        super(color, id);
        this.haveMoved = false;
        this.shortCastlingApproved = false;
        this.longCastlingApproved = false;
        this.value = 0;
        this.openingBonus = [
            [0, 0, 10, 0, 0, 0, 10, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
        ];
        this.endgameBonus = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 2, 9, 9, 9, 9, 2, 0],
            [0, 2, 9, 10, 10, 9, 2, 0],
            [0, 2, 9, 10, 10, 9, 2, 0],
            [0, 2, 9, 9, 9, 9, 2, 0],
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
        ];
    }

    render() {
        if (this.color === 1) { return require('./img/wk.png'); }
        if (this.color === -1) { return require('./img/bk.png'); }
    }
}