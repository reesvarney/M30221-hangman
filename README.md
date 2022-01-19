# Hangman (V2)
NodeJS web application created for M30221.

## Project Aims
After a previous less successful attempt at creating the game with a websocket based approach I have adopted the following goals:
 - Create a working hangman game, with feature parity to version 1
 - Complete separation between the client and functionality, providing all logic through a REST API
 - Store minimal data inside process memory, allowing for the potential of multiple server instances/ load distribution in a production environment

## Development
WIP

## Deployment
WIP

## Sources
I have used libraries or obtained data from the following sources:
 - [Express](https://www.npmjs.com/package/express)
 - Words: 
    - [ENABLE Dictionary](https://www.wordgamedictionary.com/enable/download/enable.txt)
    - Filtered with: [Bad Words List](https://www.cs.cmu.edu/~biglou/resources/bad-words.txt)