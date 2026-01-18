let ws = null;
let tvIP = null;

function setStatus(text) {
    document.getElementById("status").innerText = text;
}

async function getTVIP() {
    try {
        const res = await fetch("http://localhost:5050/tv-ip");
        const data = await res.json();
        return data.ip || null;
    } catch (e) {
        return null;
    }
}

function connectToTV(ip) {
    const url = `ws://${ip}:8001/api/v2/channels/samsung.remote.control`;
    ws = new WebSocket(url);

    ws.onopen = () => {
        setStatus(`Connected to TV (${ip})`);
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
    tvIP = await getTVIP();

    if (!tvIP) {
        setStatus("TV not found on network");
        return;
    }

    setStatus(`TV found at ${tvIP}, connecting…`);
    connectToTV(tvIP);
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
