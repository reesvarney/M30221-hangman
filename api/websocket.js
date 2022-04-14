import { WebSocketServer } from 'ws';
const clients = {};

function startServer({ server, sessionParser, lobbies }) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    sessionParser(req, {}, () => {
      const sid = req.sessionID;
      // remove leading slash
      const lobbyId = req.url.substring(1);
      if (clients[lobbyId] === undefined) {
        clients[lobbyId] = {};
      }
      if (clients[lobbyId][sid] !== undefined) {
        clearInterval(clients[lobbyId][sid].heartbeat);
        clients[lobbyId][sid].ws.terminate();
      }

      let alive = true;

      ws.on('pong', () => {
        alive = true;
      });

      const heartbeat = setInterval(async () => {
        if (alive === false) {
          clearInterval(heartbeat);
          ws.terminate();
          delete clients[lobbyId][sid];
          await lobbies.leave(lobbyId, sid);
          updateClient(lobbyId);
        }
        alive = false;
        ws.ping();
      }, 5000);

      clients[lobbyId][sid] = { ws, heartbeat };
    });
  });

  // tell all ws connections for this client to do an update
  // but send the lobby id so only one actually has to do it
  function updateClient(lobbyId, socketId = null) {
    if (socketId == null) {
      for (const sid of Object.keys(clients[lobbyId])) {
        updateClient(lobbyId, sid);
      }
    } else {
      if (clients[lobbyId] !== undefined && clients[lobbyId][socketId] !== undefined) {
        clients[lobbyId][socketId].ws.send(JSON.stringify({ event: 'do_update' }));
      }
    }
  }

  return { updateClient, clients };
}

export default startServer;
