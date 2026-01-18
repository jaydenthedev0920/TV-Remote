let ws = null;

function connectToTV(ip) {
    const url = `ws://${ip}:8001/api/v2/channels/samsung.remote.control`;

    ws = new WebSocket(url);

    ws.onopen = () => {
        setStatus("Connected");
        console.log("Connected to Samsung TV");
    };

    ws.onerror = () => {
        setStatus("Connection failed");
    };

    ws.onclose = () => {
        setStatus("Disconnected");
    };
}

function setStatus(text) {
    document.getElementById("status").innerText = text;
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

document.getElementById("connect-btn").addEventListener("click", () => {
    const ip = document.getElementById("tv-ip").value.trim();
    if (ip) connectToTV(ip);
});

document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-key");
        sendKey(key);
    });
});
