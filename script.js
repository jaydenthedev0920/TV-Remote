// =======================================
//   Samsung TV Remote - Direct Connect
//   Target TV: 192.168.1.124 (AU8000)
// =======================================

const TV_IP = "192.168.1.124";   // Confirmed AU8000 IP
const TV_PORT = 8002;            // Secure WebSocket port for Samsung TVs

let ws = null;
let reconnectTimer = null;

// ---------------------------------------
//   Connect to Samsung TV
// ---------------------------------------
function connectToTV() {
    const remoteName = btoa("JaydenRemote"); // Name shown in TV pairing popup
    const url = `wss://${TV_IP}:${TV_PORT}/api/v2/channels/samsung.remote.control?name=${remoteName}`;

    console.log("Connecting to TV:", url);

    ws = new WebSocket(url);

    ws.onopen = () => {
        console.log("Connected to TV");
        updateStatus("Connected to TV");
    };

    ws.onerror = (err) => {
        console.log("WebSocket error:", err);
        updateStatus("Connection error");
    };

    ws.onclose = () => {
        console.log("Disconnected from TV, retrying...");
        updateStatus("Disconnected, retrying...");

        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connectToTV, 2000);
    };

    ws.onmessage = (msg) => {
        console.log("TV Response:", msg.data);
    };
}

// ---------------------------------------
//   Send Remote Key to TV
// ---------------------------------------
function sendKey(key) {
    if (!ws || ws.readyState !== 1) {
        console.log("Not connected, cannot send:", key);
        updateStatus("Not connected");
        return;
    }

    const payload = {
        method: "ms.remote.control",
        params: {
            Cmd: "Click",
            DataOfCmd: key,
            Option: "false",
            TypeOfRemote: "SendRemoteKey"
        }
    };

    ws.send(JSON.stringify(payload));
    console.log("Sent key:", key);
}

// ---------------------------------------
//   Update UI Status Text
// ---------------------------------------
function updateStatus(text) {
    const el = document.getElementById("status");
    if (el) el.innerText = text;
}

// ---------------------------------------
//   Start Connection
// ---------------------------------------
connectToTV();
