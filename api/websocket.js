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

    this.alive = true;
    ws.on("pong", ()=>{
      this.alive = true;
    })
    this.heartbeat = setInterval(()=>{
      if(this.alive == false) {
        for( const handler of this.dcHandlers){
          handler();
        };
        this.ws.terminate();
        clearInterval(this.heartbeat);
      };
      this.alive = false;
      ws.ping();
    }, 3000);
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

class wsServer{
  constructor(server, {logging=false}={}){
    this.server = new WebSocketServer({ server });
    this.logging = logging;
    this.handlers = [];
    this.clients = [];
    this.server.on('connection', (ws)=>{
      const client = new wsConnection(ws, {logging});
      this.clients.push(client);
      for(const handler of this.handlers){
        handler(client);
      }
    });
  }

  on(event, handler){
    for(const client of this.clients){
      client.on(event, handler);
    };
  };

  emit(event, data){
    for(const client of this.clients){
      client.emit(event, data);
    };
  };

  onConnection(handler){
    this.handlers.push(handler);
  }
}

export default wsServer;