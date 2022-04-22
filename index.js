'use strict';
import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import { resolve } from 'path';
import { randomBytes } from 'crypto';
import db from './storage/db.js';
import lobby from './game/lobby.js';
import restAPI from './api/rest.js';
import startWSS from './api/websocket.js';

const app = express();
const port = process.env.PORT || 8080;


const server = app.listen(port, async () => {
  console.log(`Listening on port: ${server.address().port}`);

  // const dbType = process.env.DB_TYPE || 'memory';
  await db.init();

  const lobbies = lobby(db);

  app.use(express.urlencoded());
  app.use(express.json());

  app.use('/', express.static('./client'));
  app.get('/', (req, res) => {
    res.sendFile(resolve('./client/index.html'));
  });

  app.get('/game', (req, res) => {
    res.sendFile(resolve('./client/game.html'));
  });

  app.get('/results/:id', (req, res) => {
    res.sendFile(resolve('./client/results.html'));
  });

  app.get('/game/new', async (req, res) => {
    const newLobby = await lobbies.create();
    res.redirect(`/game?id=${newLobby}`);
  });

  app.get('/game/random', async (req, res) => {
    try {
      const randomLobby = await lobbies.getPublic();
      res.redirect(`/game?id=${randomLobby}`);
    } catch (err) {
      // Should mean that lobby does not exist
      res.redirect('/?error=no_lobbies');
    }
  });

  const sessionParser = session({
    // cookies won't need to be saved between server sessions so this can be created dynamically
    secret: randomBytes(8).toString('hex'),
    resave: false,
    saveUninitialized: true,
  });

  app.use(sessionParser);


  const wss = startWSS({ server, lobbies, sessionParser });
  app.use('/api', restAPI({ express, db, lobbies, wss }).router);
});
