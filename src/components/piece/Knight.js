import Piece from './Piece'

export default class Knight extends Piece{
    constructor(color, id) {
        super(color, id)
        this.value = 3
    }

    render() {
        if (this.color === 1) {return require('./img/wn.png')}
        if (this.color === -1) {return require('./img/bn.png')}
    }
}