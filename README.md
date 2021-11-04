
# Multiplayer Poker Game

A Multiplayer Poker Game that uses WebSockets
- Implemented using the **MERN** (MongoDB, Express, React, NodeJS) stack
- Socket.io is used to provide WebSocket support
- Users can play with each other using **Room Codes** or choose to queue up for automatic **Matchmaking**
- Although the game does not need a database, we have implemented **user authentication** using a **REST API** that requires us to store data.
- Uses JWT authentication patterns, implemented **Refresh Tokens** and **Access Tokens** to protect against XSS attacks. Tokens are stored in Secure, HttpOnly Cookies as opposed to LocalStorage for further protection
- Passwords are **hashed** using the library bcrypt before saving
- A confirmation email is sent to users before activating their account

## Live Demo
**You may try the game out by yourself by opening it on two different tabs & clicking the *Matchmaking* button**  
- [https://raghu-poker-game.netlify.app/](https://raghu-poker-game.netlify.app/)

## Author

- [Raghunath Prabhakar](https://www.github.com/Raghuboi)

