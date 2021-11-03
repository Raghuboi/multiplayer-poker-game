import React from 'react'

function Card({ value, suit, className }) {
    return (
        <>
            {suit!=='BACK'&&<img className={className} alt={suit+"-"+value} src={require(`../../assets/cards/${suit.toUpperCase()}/${suit.toUpperCase()}_${value}.svg`).default}/>}
            {suit==='BACK'&&<img className={className} alt={suit+"-"+value} src={require(`../../assets/cards/${suit}.svg`).default}/>}
        </>
    )
}

export default Card