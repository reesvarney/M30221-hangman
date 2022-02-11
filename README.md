# Hangman (V2)
NodeJS web application created for Application Programming M30221.

## Project Aims
After a previous less successful attempt at creating the game with a websocket based approach I have adopted the following goals:
 - Create a working hangman game, with feature parity to version 1
 - Complete separation between the client and functionality, providing all logic through a REST API
 - Store minimal data inside process memory, allowing for the potential of multiple server instances/ load distribution in a production environment

## Development
### Setup
1. Install nvm https://github.com/nvm-sh/nvm
2. Clone the repository
```bash
git clone git@github.com:reesvarney/hangman2.git
```
3. Open the directory
```bash
cd ./hangman2
```
4. Install the correct version of NodeJS
```bash
nvm install
```
5. Install npm dependencies
```bash
npm i
```

### Practices
#### Variable naming
 - HTML Classes: `dash-case`
 - HTML ID's: `snake_case`
 - JS: `lowerCamelCase`
 - JS (Instantiable): `UpperCamelCase`
 - SQL: `snake_case`


## Deployment
WIP

## Sources
I have used libraries or obtained data from the following sources:
 - [Express](https://www.npmjs.com/package/express)
 - Words: 
    - [ENABLE Dictionary](https://www.wordgamedictionary.com/enable/download/enable.txt)
    - Filtered with: [Bad Words List](https://www.cs.cmu.edu/~biglou/resources/bad-words.txt)