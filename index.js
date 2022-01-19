"use strict";
import "dotenv/config";
import express from "express";
const app = express();
const port = process.env.PORT || 8080;
const dbType = process.env.DB_TYPE || "memory";

app.use('/', express.static('./client'));
app.get('/', (req,res)=>{
  res.sendFile("./client/index.html")
});

import game from './game.js';
app.use('/game', game(express));