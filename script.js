let ws = null;
let tvIP = null;
let tvPort = null;

function setStatus(text) {
    document.getElementById("status").innerText = text;
}

async function getTVInfo() {
    try {
        const res = await fetch("http://localhost:5050/tv-ip");
        const data = await res.json();
        if (!data.ip || !data.port) return null;
        return data;
    } catch (e) {
        return null;
    }
}

function connectToTV(ip, port) {
    const isSecure = port === 8002;
    const protocol = isSecure ? "wss" : "ws";
    const url = `${protocol}://${ip}:${port}/api/v2/channels/samsung.remote.control`;

    ws = new WebSocket(url);

    ws.onopen = () => {
        setStatus(`Connected to TV (${ip}:${port})`);
        console.log("Connected to Samsung TV");
    };

    ws.onerror = () => {
        setStatus("Connection error");
    };

    ws.onclose = () => {
        setStatus("Disconnected");
    };
}

function sendKey(key) {
    if (!ws || ws.readyState !== 1) {
        setStatus("Not connected");
        return;
    }

    const cmd = {
        method: "ms.remote.control",
        params: {
            Cmd: "Click",
            DataOfCmd: key,
            Option: "false",
            TypeOfRemote: "SendRemoteKey"
        }
    };

    ws.send(JSON.stringify(cmd));
}

async function init() {
    setStatus("Searching for TV…");
    const info = await getTVInfo();

    if (!info) {
        setStatus("TV not found on network");
        return;
    }

    tvIP = info.ip;
    tvPort = info.port;

    setStatus(`TV found at ${tvIP}:${tvPort}, connecting…`);
    connectToTV(tvIP, tvPort);
}

document.addEventListener("DOMContentLoaded", () => {
    init();

    document.querySelectorAll("[data-key]").forEach(el => {
        el.addEventListener("click", () => {
            const key = el.getAttribute("data-key");
            sendKey(key);
        });
    });
});
