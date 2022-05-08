import Piece from './Piece'

export default class Queen extends Piece{

    render() {
        if (this.color === 1) {return require('./img/wq.png')}
        if (this.color === -1) {return require('./img/bq.png')}
    }
}