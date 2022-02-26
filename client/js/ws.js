class WebsocketConnection{
  constructor(url){
    this.connection = new WebSocket(url);
    this.createListeners();
    this.handlers = {};
  }

  createListeners(){
    this.connection.onmessage = (e)=>{
      const {event, data} = JSON.parse(e.data);
      console.log("WS RECEIVED ",{event,data})
      if(this.handlers[event] !== undefined){
        for(const handler of this.handlers[event]){
          handler(data);
        }
      }
    }
  }

  emit(event, data){
    console.log("WS SENT ", {event, data});
    this.connection.send(JSON.stringify({event, data}));
  }

  on(event, handler){
    if(this.handlers[event] === undefined){
      this.handlers[event] = [];
    };
    this.handlers[event].push(handler);
  }
}

export default WebsocketConnection;