class WebsocketConnection{
  constructor(){
    this.connection = new WebSocket(`ws://${window.location.host}/${window.gameId}`);
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

  on(event, handler){
    if(this.handlers[event] === undefined){
      this.handlers[event] = [];
    };
    this.handlers[event].push(handler);
  }
}

export default WebsocketConnection;