// server.js
// Local helper to auto-detect Samsung TV IP on your LAN

const http = require("http");
const net = require("net");

const PORT = 5050;
const SUBNETS = ["192.168.0.", "192.168.1."];
const TV_PORT = 8001;

function checkHost(ip) {
    return new Promise(resolve => {
        const socket = new net.Socket();
        let found = false;

        socket.setTimeout(400);

        socket.on("connect", () => {
            found = true;
            socket.destroy();
            resolve(ip);
        });

        socket.on("timeout", () => {
            socket.destroy();
            resolve(null);
        });

        socket.on("error", () => {
            resolve(null);
        });

        socket.connect(TV_PORT, ip);
    });
}

async function findTV() {
    for (const subnet of SUBNETS) {
        const checks = [];
        for (let i = 2; i < 255; i++) {
            const ip = subnet + i;
            checks.push(checkHost(ip));
        }
        const results = await Promise.all(checks);
        const hit = results.find(r => r !== null);
        if (hit) return hit;
    }
    return null;
}

const server = http.createServer(async (req, res) => {
    if (req.url === "/tv-ip") {
        const ip = await findTV();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ip }));
    } else {
        res.writeHead(404);
        res.end("Not found");
    }
});

server.listen(PORT, () => {
    console.log(`Helper running at http://localhost:${PORT}`);
});
