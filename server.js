// server.js
// Local helper to auto-detect Samsung TV IP + port on your LAN

const http = require("http");
const net = require("net");
const os = require("os");

const PORT = 5050;
const TV_PORTS = [8001, 8002]; // 8001 = ws, 8002 = wss

function getLocalSubnetPrefix() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (
                iface.family === "IPv4" &&
                !iface.internal &&
                (iface.address.startsWith("192.168.") ||
                 iface.address.startsWith("10.") ||
                 iface.address.startsWith("172."))
            ) {
                const parts = iface.address.split(".");
                return parts[0] + "." + parts[1] + "." + parts[2] + ".";
            }
        }
    }
    return null;
}

function checkHost(ip, port) {
    return new Promise(resolve => {
        const socket = new net.Socket();

        socket.setTimeout(400);

        socket.on("connect", () => {
            socket.destroy();
            resolve({ ip, port });
        });

        socket.on("timeout", () => {
            socket.destroy();
            resolve(null);
        });

        socket.on("error", () => {
            resolve(null);
        });

        socket.connect(port, ip);
    });
}

async function findTV() {
    const subnet = getLocalSubnetPrefix();
    if (!subnet) return null;

    const checks = [];

    for (let i = 2; i < 255; i++) {
        const ip = subnet + i;
        for (const port of TV_PORTS) {
            checks.push(checkHost(ip, port));
        }
    }

    const results = await Promise.all(checks);
    const hit = results.find(r => r !== null);
    return hit || null;
}

const server = http.createServer(async (req, res) => {
    if (req.url === "/tv-ip") {
        const result = await findTV();
        res.writeHead(200, { "Content-Type": "application/json" });
        if (!result) {
            res.end(JSON.stringify({ ip: null, port: null }));
        } else {
            res.end(JSON.stringify({ ip: result.ip, port: result.port }));
        }
    } else {
        res.writeHead(404);
        res.end("Not found");
    }
});

server.listen(PORT, () => {
    console.log(`Helper running at http://localhost:${PORT}`);
});
