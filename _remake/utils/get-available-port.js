const net = require("net");
import RemakeStore from "../lib/remake-store";
const portSearchStartsAt = process.env.PORT || 3000;


export default function getAvailablePort() {

  function getNextAvailablePort(currentPort, cb) {
    currentPort = parseInt(currentPort, 10);
    const server = net.createServer();
    server.listen(currentPort, _ => {
      server.once("close", _ => {
        cb(currentPort);
      });
      server.close();
    });
    server.on("error", _ => {
      getNextAvailablePort(currentPort + 100, cb);
    });
  }

  return new Promise(resolve => {
    if (RemakeStore.isDevelopmentMode()) {
      getNextAvailablePort(portSearchStartsAt, resolve);
    } else {
      resolve(portSearchStartsAt);
    }
  });
}
