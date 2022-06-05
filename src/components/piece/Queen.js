import Piece from './Piece'

export default class Queen extends Piece{
    constructor(color, id) {
        super(color, id)
        this.value = 9
    }

    render() {
        if (this.color === 1) {return require('./img/wq.png')}
        if (this.color === -1) {return require('./img/bq.png')}
    }
}