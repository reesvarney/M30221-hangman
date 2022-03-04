"use strict";
import "dotenv/config";
import express from "express";
import {resolve } from "path";
const app = express();
const port = process.env.PORT || 8080;

const dbType = process.env.DB_TYPE || "memory";
import db from "./storage/db.js";
await db.init();

import lobby from './game/lobby.js'; 
const lobbies = lobby(db);

app.use(express.urlencoded());
app.use(express.json());
app.use('/', express.static('./client'));
app.get('/', (req,res)=>{
  res.sendFile(resolve("./client/index.html"))
});

app.get('/game', (req,res)=>{
  res.sendFile(resolve("./client/game.html"))
});

app.get('/game/new', async(req,res)=>{
  const newLobby = await lobbies.create();
  res.redirect(`/game?id=${newLobby}`);
});

import { randomBytes } from "crypto";
import session from "express-session";
const sessionParser = session({
  // cookies won't need to be saved between server sessions so this can be created dynamically
  secret: randomBytes(8).toString("hex"),
  resave: false,
  saveUninitialized: true
})
app.use(sessionParser);

const server = app.listen(port, ()=>{
  console.log(`Listening on port: ${server.address().port}`)
});

import startWSS from './api/websocket.js';
const wss = startWSS({server, lobbies, sessionParser});

import restAPI from './api/rest.js';
app.use('/api', restAPI({express, db, lobbies, wss}).router);