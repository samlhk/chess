import Piece from './Piece'

export default class Knight extends Piece{

    render() {
        if (this.color === 1) {return require('./img/wn.png')}
        if (this.color === -1) {return require('./img/bn.png')}
    }
}