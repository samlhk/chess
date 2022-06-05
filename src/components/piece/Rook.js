import Piece from './Piece'

export default class Rook extends Piece{

    constructor(color, id) {
        super(color, id)
        this.haveMoved = false
        this.value = 5
    }

    render() {
        if (this.color === 1) {return require('./img/wr.png')}
        if (this.color === -1) {return require('./img/br.png')}
    }
}