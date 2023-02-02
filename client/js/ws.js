class WebsocketConnection {
  constructor() {
    this.connection = new WebSocket(`ws${(location.protocol == "https") ? "s" : ""}://${window.location.host}/${window.gameId}`);
    this.createListeners();
    this.handlers = {};
  }

  createListeners() {
    this.connection.onmessage = (e) => {
      const { event, data } = JSON.parse(e.data);
      console.log('Received WebSocket Message:', event);
      if (this.handlers[event] !== undefined) {
        for (const handler of this.handlers[event]) {
          handler(data);
        }
      }
    };

    this.connection.onclose = () => {
      window.location.href = '/';
    };
  }

  on(event, handler) {
    if (this.handlers[event] === undefined) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }
}

export default WebsocketConnection;
