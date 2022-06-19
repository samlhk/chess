const Panel = ({ onResign, drawRequested, onDraw, turn, engineCalculating }) => {
  return (
    <div>
      {engineCalculating && (
        <div id='engine-indicator'>
          Engine Calculating<br/>
          <i className='fa fa-spinner rotate'/>
        </div>
      )}
      {!engineCalculating && (<>
      <div id='turn-indicator'>
          {turn > 0 ? <div>White</div> : <div>Black</div>}
        </div>
      <button className='btn btn-block btn-danger' onClick={onResign}>Resign</button></>)}
      {(() => {
        switch(drawRequested) {
          case 0: 
            return (<button className='btn btn-block btn-warning' onClick={onDraw}>Request Draw</button>)
          case -1 * turn:
            return (<button className='btn btn-block btn-success' onClick={onDraw}>Accept Draw</button>)
          default:
            return
        }
      })()}
    </div>
  )
}

export default Panel