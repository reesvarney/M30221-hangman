import  { WebSocketServer } from "ws";
import { randomUUID} from "crypto";
class wsConnection{
  constructor(ws, {logging=false}={}){
    this.handlers = {};
    this.logging = logging;
    this.ws = ws;
    this.id = randomUUID();
    this.dcHandlers = [];
    ws.on('message', (msg)=>{
      try{
        const {event, data} = JSON.parse(msg.toString());
        if(typeof event !== "string"){
          throw("Invalid type for event");
        }
        if(this.logging) console.log("WS RECEIVED ", {event, data});
        if(this.handlers[event] !== undefined){
          for(const {handler, group} of this.handlers[event]){
            handler(data);
          };
        };
      } catch(err){
        console.log(err);
        this.emit("client_error", JSON.stringify(err));
      }
    });
  }

  on(event, handler, group="main"){
    if(this.handlers[event] === undefined){
      this.handlers[event] = [];
    };
    this.handlers[event].push({handler, group});
  }

  removeGroup(eventGroup){
    for(const [event, eventHandlers] of Object.entries(this.handlers)){
      this.handlers[event] = eventHandlers.filter(a=>a.group !== eventGroup);
    }
  }

  emit(event, data=null){
    if(this.logging) console.log("WS SENT ", {event,data})
    this.ws.send(JSON.stringify({event, data}));
  }

  onDisconnect(handler){
    this.dcHandlers.push(handler);
  }
}

let server;
const clients = {};

function startServer(){
  server = new WebSocketServer({ server });
  this.server.on('connection', (ws)=>{
    clients[randomUUID()] = ws;
    addHandlers(ws);
  });
}

function sendMessage(id, data){
  clients[id].send(JSON.stringify(data));
}

function addHeartbeat(ws){
  let alive = true;
  ws.on("pong", ()=>{
    alive = true;
  })
  
  let heartbeat = setInterval(()=>{
    if(this.alive == false) {
      ws.terminate();
      clearInterval(heartbeat);
    };
    alive = false;
    ws.ping();
  }, 3000);
}

function addHandlers(ws){
  ws
}

export default {startServer, clients, sendMessage};