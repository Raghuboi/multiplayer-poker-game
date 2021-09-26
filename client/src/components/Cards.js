import React from 'react'
import Card from './Card'
import Spinner from './Spinner'

export default function Cards({ player1Deck, player2Deck, houseDeck, gameOver, currentUser, player1Chips, player2Chips, turn, winner }) {
    
    return (
        <div className="cards">
            {winner==='Player 2' && <h3 style={{color: "#FFD700"}}>Player 2 👑</h3>||<h3>Player 2</h3>}
            <div className="player-2">
                <div className="player-2-cards">
                    {player2Deck && player2Deck.map(item => {
                        if ((currentUser==='Player 2') || (gameOver===true)) return <Card className="player-card" value={item.value} suit={item.suit}/>
                        else return <Card className="player-card-back" suit='BACK' />
                    })}
                </div>
                <div className="player-info">
                    <h4 className="chips">Chips: {player2Chips}</h4>
                    {currentUser==='Player 1' && turn==='Player 2' && gameOver===false && <Spinner/>}
                </div>
            </div>
            <h3>House</h3>
            <div className="house">
                <div className="house-cards">
                    {houseDeck && houseDeck.map(item => {
                        return <Card value={item.value} suit={item.suit} className="card"/>
                    })}
                </div>
            </div>
            {winner==='Player 1' && <h3 style={{color: "#FFD700"}}>Player 1 👑</h3>||<h3>Player 1</h3>}
            <div className="player-1">
            <div className="player-info" >
                <h4 className="chips">Chips: {player1Chips}</h4>
                {currentUser==='Player 2' && turn==='Player 1' && gameOver===false && <Spinner/>}
            </div>
                <div className="player-1-cards">
                    {player1Deck && player1Deck.map(item => {
                        if ((currentUser==='Player 1') || (gameOver===true) ) return <Card className="player-card" value={item.value} suit={item.suit}/>
                        else return <Card className="player-card-back" suit='BACK' />
                    })}
                </div>
            </div>
        </div>
    )
}
