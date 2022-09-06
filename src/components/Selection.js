const Selection = ({ turn, onResolve }) => {
  return (
    <div>
        <h2>Choose the piece to promote to: </h2>
        {turn === 1 && (
            <>
            <button onClick={() => {onResolve('q')}}><img src={require('./piece/img/wq.png')} alt='queen' className='pointer' /></button>
            <button onClick={() => {onResolve('r')}}><img src={require('./piece/img/wr.png')} alt='rook' className='pointer' /></button>
            <button onClick={() => {onResolve('b')}}><img src={require('./piece/img/wb.png')} alt='bishop' className='pointer' /></button>
            <button onClick={() => {onResolve('n')}}><img src={require('./piece/img/wn.png')} alt='knight' className='pointer' /></button>
            </>
        )}
        {turn === -1 && (
            <>
            <button onClick={() => {onResolve('q')}}><img src={require('./piece/img/bq.png')} alt='queen' className='pointer' /></button>
            <button onClick={() => {onResolve('r')}}><img src={require('./piece/img/br.png')} alt='rook' className='pointer' /></button>
            <button onClick={() => {onResolve('b')}}><img src={require('./piece/img/bb.png')} alt='bishop' className='pointer' /></button>
            <button onClick={() => {onResolve('n')}}><img src={require('./piece/img/bn.png')} alt='knight' className='pointer' /></button>
            </>
        )}
    </div>
  )
}

export default Selection