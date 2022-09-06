import React from 'react'

const ChoosingMenu = ({ onChoose }) => {
  return (
    <div>
        <h1>Choose your side</h1>
        <button onClick={() => {onChoose(1)}}><img src={require('./piece/img/wk.png')} alt='white' className='pointer' /></button>
        <button onClick={() => {onChoose(-1)}}><img src={require('./piece/img/bk.png')} alt='black' className='pointer' /></button>
    </div>
  )
}

export default ChoosingMenu