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

app.use('/', express.static('./client'));
app.get('/', (req,res)=>{
  res.sendFile(resolve("./client/index.html"))
});

app.get('/game', (req,res)=>{
  res.sendFile(resolve("./client/game.html"))
});

import restAPI from './api/rest.js';
app.use('/api', restAPI({express, db, lobby}).router);

// import wsAPI from './api/websocket.js';
// wsAPI(express, db);

const server = app.listen(port, ()=>{
  console.log(`Listening on port: ${server.address().port}`)
});