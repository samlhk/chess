import Piece from './Piece'

export default class King extends Piece{

    constructor(color, id) {
        super(color, id)
        this.haveMoved = false
        this.shortCastlingApproved = false
        this.longCastlingApproved = false
        this.value = 0
    }

    render() {
        if (this.color === 1) {return require('./img/wk.png')}
        if (this.color === -1) {return require('./img/bk.png')}
    }
}