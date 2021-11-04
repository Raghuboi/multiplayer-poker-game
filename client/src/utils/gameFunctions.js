export function getHand(pDeck, hDeck) {
    var valueMatch=[], suitMatch={}, twoMatches=[], threeMatches=[], fourMatches=[]
    var hand={type: 'None'}

    const playerDeck = pDeck.filter(item => { if (item) return item })
    const houseDeck = hDeck.filter(item => { if (item) return item })

    // combining the player's cards (playerDeck) with the community cards (houseDeck) into a single deck for ease of access 
    // also replacing J,Q,K,A suits with numerical values (11,12,13,14) for consistency

    const combined = playerDeck && houseDeck && playerDeck.concat(houseDeck).map(item => {
        if (!item) return 
        else if (item.value === 'J') return {suit: item.suit, value: 11}
        else if (item.value === 'Q') return {suit: item.suit, value: 12}
        else if (item.value === 'K') return {suit: item.suit, value: 13}
        else if (item.value === 'A') return {suit: item.suit, value: 14}
        else return {suit: item.suit, value: item.value}
      })

    if (!combined) return "Error"
      
    // seperating values and suits to minimize the use of .map() later 

    const values = combined.map(item=> {return item.value})
    const descending = values.sort((a, b) => {return b-a})
    const suits = combined.map(item=> {return item.suit})

    // counting the number of value pairs and suit pairs to determine hands
      
    values.forEach(x=> { valueMatch[x] = (valueMatch[x] || 0) + 1 })
    suits.forEach(x=> { suitMatch[x] = (suitMatch[x] || 0) + 1 })

    // filtering the different value pairs into their respective arrays for ease of access later

    for(var i=1;i<14;i++) {
        if (valueMatch[i] === 2) twoMatches.push(i)
        else if (valueMatch[i] === 3) threeMatches.push(i)
        else if (valueMatch[i] === 4) fourMatches.push(i) 
    }

    // determining the different types of hands and storing them in a hand object

    combined.forEach(({ suit, value }) => {
        const Straight = (values.includes(value+1)&&values.includes(value+2)&&values.includes(value+3)&&values.includes(value+4)) ? true : false

        const StraightFlush = (combined.some(e => {return ((e.value === value+1)&&(e.suit === suit))})) &&
        (combined.some(e => {return ((e.value === value+2)&&(e.suit === suit))})) &&
        (combined.some(e => {return ((e.value === value+3)&&(e.suit === suit))})) && 
        (combined.some(e => {return ((e.value === value+4)&&(e.suit === suit))}))

        // 'Five High' & 'Steel Wheel' are exception cases with the cards 'A,2,3,4,5'-- these are the only cases where A acts as a low card
        const FiveHigh = (values.includes(14)&&values.includes(2)&&values.includes(3)&&values.includes(4)&&values.includes(5)) ? true : false

        const SteelWheel = (combined.some(e => {return ((e.value === 14)&&(e.suit === suit))})) &&
        (combined.some(e => {return ((e.value === 2)&&(e.suit === suit))})) &&
        (combined.some(e => {return ((e.value === 3)&&(e.suit === suit))})) && 
        (combined.some(e => {return ((e.value === 4)&&(e.suit === suit))})) && 
        (combined.some(e => {return ((e.value === 4)&&(e.suit === suit))}))


        if ((value===10)&&(StraightFlush)) {
            hand.type = 'Royal Flush'

            /* 
            *   although some house rules dictate that one suit of Royal Flush can beat another, competitive poker states that 
            *   2 Royal Flushes will always be a Tie.
            * 
            *   Moreover, considering the 1 in 649,739 chance of 2 Royal Flushes to appear in a game we are not going to bother with it.
            */

            // hand.royalFlushSuit = suit 
        } 
        
        else if (StraightFlush) {
            hand.type = 'Straight Flush'
            hand.primary = value+4
        } 

        else if (Straight) {
            hand.type = 'Straight'
            hand.primary = value+4
        } 

        else if (([14,2,3,4,5].includes(value)) && (SteelWheel)) {
            hand.type = 'Straight Flush'
            hand.primary = 5
        } 

        else if (([14,2,3,4,5].includes(value)) && (FiveHigh)) {
            hand.type = 'Straight'
            hand.primary = 5
        } 
    })

    if ((hand.type==='None')&&(twoMatches.length===1)&&(threeMatches.length===0)) {
        hand.type = 'One Pair'
        hand.primary = twoMatches[0]

        const descendingFiltered = descending.filter(e => {return e!==hand.primary})
        hand.secondary = descendingFiltered[0]
        hand.tertiary = descendingFiltered[1]
    }

    else if (twoMatches.length===2) {
        hand.type = 'Two Pair'
        hand.primary = twoMatches[1]
        hand.secondary = twoMatches[0]

        hand.tertiary = descending.filter(e => {return (e!==hand.primary && e!==hand.secondary )})[0]
    } 

    else if (twoMatches.length>2) {
        hand.type = 'Two Pair'
        hand.primary = twoMatches[twoMatches.length]
        hand.secondary = twoMatches[twoMatches.length - 1]

        hand.tertiary = descending.filter(e => {return (e!==hand.primary && e!==hand.secondary )})[0]
    }

    else if ((twoMatches.length===0)&&(threeMatches.length===1)) {
        hand.type = 'Three of a kind'
        hand.primary = threeMatches[0]

        hand.secondary = descending.filter(e => {return e!==hand.primary})[0]
    }

    else if ((Object.keys(suitMatch).length<4) && checkFlush(suitMatch)) {
        hand.type = 'Flush'
        hand.primary = descending[0]
    }

    else if ((twoMatches.length===1)&&(threeMatches.length===1)) {
        hand.type = 'Full House'
        hand.primary = threeMatches[0]
        hand.secondary = twoMatches[0]
    } 

    else if (fourMatches.length===1) {
        hand.type = 'Four of a kind'
        hand.primary = fourMatches[0]
        hand.secondary = descending.filter(e => {return e!==hand.primary})[0]
    }

    //for no pairs/hands we sort the values array in descending order and then choose the first element (for high card)
    // for Royal Flush, Flush and Straight we do the same in case of a tie.

    else if ((hand.type = 'None') || (['Royal Flush','Straight Flush','Straight'].includes(hand.type))) {
        hand.primary = descending[0]
        hand.secondary = descending[1]
    }

    return hand
}

export function getWinner(p1, p2, hand1, hand2) {
    const rank1 = getRank(hand1.type), rank2 = getRank(hand2.type) 
    
    function getRank(handType) {
        var rank

        switch (handType) {
            case 'None': rank=0; break;
            case 'One Pair': rank=1; break;
            case 'Two Pair': rank=2; break;
            case 'Three of a kind': rank=3; break;
            case 'Straight': rank=4; break;
            case 'Flush': rank=5; break;
            case 'Full House': rank=6; break;
            case 'Four of a kind': rank=7; break;
            case 'Straight Flush': rank=8; break;
            case 'Royal Flush': rank=8;
          }

          return rank
    }

    if (rank1 > rank2) return p1
    else if (rank1 < rank2) return p2

    else if (rank1 === rank2) {
        if (rank1!=='Royal Flush') {

            if (hand1.primary > hand2.primary) return p1
            else if (hand1.primary < hand2.primary) return p2

            else if (hand1.primary === hand2.primary) {

                if (hand1.secondary) { // checks if secondary criteria exists

                    if (hand1.secondary > hand2.secondary) return p1
                    else if (hand1.secondary < hand2.secondary) return p2

                    else if (hand1.secondary === hand2.secondary) {

                        if (hand1.tertiary) { // checks if tertiary criteria exists

                            if (hand1.tertiary > hand2.tertiary) return p1
                            else if (hand1.tertiary < hand2.tertiary) return p2
                            
                            else if (hand1.tertiary === hand2.tertiary) return 'Tie'
                        }

                        else return 'Tie'
                    }

                }
                
                else return 'Tie'
            }
        }

        else if (rank1==='Royal Flush') {
            return 'Tie'
        }
    }



}

function checkFlush(suitMatch) {
    if (suitMatch.diamonds && suitMatch.diamonds >= 5) return true
    else if (suitMatch.clubs && suitMatch.clubs >= 5) return true
    else if (suitMatch.spades && suitMatch.spades >= 5) return true
    else if (suitMatch.hearts && suitMatch.hearts >= 5) return true

    else return false
}