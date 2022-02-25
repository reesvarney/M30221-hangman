"use strict";
import "dotenv/config";
import express from "express";
const app = express();
const port = process.env.PORT || 8080;

const dbType = process.env.DB_TYPE || "memory";
import db from "./storage/db.js";
await db.init();

app.use('/', express.static('./client'));
app.get('/', (req,res)=>{
  res.sendFile("./client/index.html")
});

app.get('/game', (req,res)=>{
  res.sendFile("./client/game.html")
});

import restAPI from './api/rest.js';
app.use('/api', restAPI({express, db}).router);

// import wsAPI from './api/websocket.js';
// wsAPI(express, db);

const server = app.listen(port, ()=>{
  console.log(`Listening on port: ${server.address().port}`)
});