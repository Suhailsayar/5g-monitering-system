from flask import Flask, jsonify, render_template
import random
import time
import math
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# ─── All 28 State Capitals + 8 UT Capitals ───────────────────────────────────
TOWERS = [
    {"id": "AP-001", "name": "Andhra Pradesh", "city": "Amaravati", "operator": "Airtel", "status": "active", "band": "n78"},
    {"id": "AR-002", "name": "Arunachal Pradesh", "city": "Itanagar", "operator": "Jio", "status": "degraded", "band": "n41"},
    {"id": "AS-003", "name": "Assam", "city": "Dispur", "operator": "Vi", "status": "offline", "band": "mmWave"},
    {"id": "BR-004", "name": "Bihar", "city": "Patna", "operator": "Airtel", "status": "active", "band": "n78"},
    {"id": "CG-005", "name": "Chhattisgarh", "city": "Raipur", "operator": "Jio", "status": "degraded", "band": "n41"},
    {"id": "GA-006", "name": "Goa", "city": "Panaji", "operator": "Vi", "status": "active", "band": "mmWave"},
    {"id": "GJ-007", "name": "Gujarat", "city": "Gandhinagar", "operator": "Airtel", "status": "active", "band": "n78"},
    {"id": "HR-008", "name": "Haryana", "city": "Chandigarh", "operator": "Jio", "status": "offline", "band": "n41"},
    {"id": "HP-009", "name": "Himachal Pradesh", "city": "Shimla", "operator": "Vi", "status": "active", "band": "mmWave"},
    {"id": "JH-010", "name": "Jharkhand", "city": "Ranchi", "operator": "Airtel", "status": "degraded", "band": "n78"},
    {"id": "KA-011", "name": "Karnataka", "city": "Bengaluru", "operator": "Jio", "status": "active", "band": "n41"},
    {"id": "KL-012", "name": "Kerala", "city": "Thiruvananthapuram", "operator": "Vi", "status": "offline", "band": "mmWave"},
    {"id": "MP-013", "name": "Madhya Pradesh", "city": "Bhopal", "operator": "Airtel", "status": "active", "band": "n78"},
    {"id": "MH-014", "name": "Maharashtra", "city": "Mumbai", "operator": "Jio", "status": "degraded", "band": "n41"},
    {"id": "MN-015", "name": "Manipur", "city": "Imphal", "operator": "Vi", "status": "active", "band": "mmWave"},
    {"id": "ML-016", "name": "Meghalaya", "city": "Shillong", "operator": "Airtel", "status": "offline", "band": "n78"},
    {"id": "MZ-017", "name": "Mizoram", "city": "Aizawl", "operator": "Jio", "status": "active", "band": "n41"},
    {"id": "NL-018", "name": "Nagaland", "city": "Kohima", "operator": "Vi", "status": "degraded", "band": "mmWave"},
    {"id": "OR-019", "name": "Odisha", "city": "Bhubaneswar", "operator": "Airtel", "status": "active", "band": "n78"},
    {"id": "PB-020", "name": "Punjab", "city": "Chandigarh", "operator": "Jio", "status": "offline", "band": "n41"},
    {"id": "RJ-021", "name": "Rajasthan", "city": "Jaipur", "operator": "Vi", "status": "active", "band": "mmWave"},
    {"id": "SK-022", "name": "Sikkim", "city": "Gangtok", "operator": "Airtel", "status": "degraded", "band": "n78"},
    {"id": "TN-023", "name": "Tamil Nadu", "city": "Chennai", "operator": "Jio", "status": "active", "band": "n41"},
    {"id": "TG-024", "name": "Telangana", "city": "Hyderabad", "operator": "Vi", "status": "offline", "band": "mmWave"},
    {"id": "TR-025", "name": "Tripura", "city": "Agartala", "operator": "Airtel", "status": "active", "band": "n78"},
    {"id": "UP-026", "name": "Uttar Pradesh", "city": "Lucknow", "operator": "Jio", "status": "degraded", "band": "n41"},
    {"id": "UK-027", "name": "Uttarakhand", "city": "Dehradun", "operator": "Vi", "status": "active", "band": "mmWave"},
    {"id": "WB-028", "name": "West Bengal", "city": "Kolkata", "operator": "Airtel", "status": "offline", "band": "n78"},
    # Union Territories (id prefix AN/CH/DN/DL/JK/LA/LD/PY)
    {"id": "AN-029", "name": "Andaman & Nicobar", "city": "Port Blair", "operator": "Jio", "status": "active", "band": "n41", "is_ut": True},
    {"id": "CH-030", "name": "Chandigarh UT", "city": "Chandigarh", "operator": "Vi", "status": "degraded", "band": "mmWave", "is_ut": True},
    {"id": "DN-031", "name": "Dadra & NH / DD", "city": "Daman", "operator": "Airtel", "status": "active", "band": "n78", "is_ut": True},
    {"id": "DL-032", "name": "Delhi", "city": "New Delhi", "operator": "Jio", "status": "offline", "band": "n41", "is_ut": True},
    {"id": "JK-033", "name": "Jammu & Kashmir", "city": "Srinagar", "operator": "Airtel", "status": "active", "band": "mmWave", "is_ut": True},
    {"id": "LA-034", "name": "Ladakh", "city": "Leh", "operator": "Airtel", "status": "degraded", "band": "n78", "is_ut": True},
    {"id": "LD-035", "name": "Lakshadweep", "city": "Kavaratti", "operator": "Jio", "status": "active", "band": "n41", "is_ut": True},
    {"id": "PY-036", "name": "Puducherry", "city": "Puducherry", "operator": "Vi", "status": "offline", "band": "mmWave", "is_ut": True},
]

# Mark states explicitly
for t in TOWERS:
    if "is_ut" not in t:
        t["is_ut"] = False

BAND_MULT = {"mmWave": 1.9, "n41": 1.0, "n78": 1.1}
STATUS_BASE = {"active": (900, 2.0), "degraded": (260, 12.0), "offline": (0, 0)}

def simulate_metrics(tower):
    if tower["status"] == "offline":
        return {
            "throughput": 0,
            "latency": 0,
            "signal_strength": -120,
            "connected_devices": 0,
            "packet_loss": 100.0,
            "uptime": 0.0,
        }
    t = time.time()
    seed = sum(ord(c) for c in tower["id"])
    noise = math.sin(t * 0.4 + seed) * 0.12
    base_tp, base_lat = STATUS_BASE[tower["status"]]
    mult = BAND_MULT.get(tower["band"], 1.0)
    tp = max(10, base_tp * mult * (1 + noise + random.uniform(-0.06, 0.06)))
    lat = max(0.5, base_lat * (1 - noise * 0.5) + random.uniform(-0.3, 0.3))
    rsrp = -72 + noise * 8 + random.uniform(-3, 3) if tower["status"] == "active" else -95 + random.uniform(-3, 3)
    dev = int((tp / 10) * (0.9 + random.uniform(0, 0.2)))
    pkt = max(0, 0.1 + random.uniform(0, 0.3)) if tower["status"] == "active" else max(0, 3 + random.uniform(0, 0.5))
    upt = 99.5 + random.uniform(0, 0.5) if tower["status"] == "active" else 87 + random.uniform(0, 8)
    return {
        "throughput": round(tp, 1),
        "latency": round(lat, 2),
        "signal_strength": round(rsrp, 1),
        "connected_devices": dev,
        "packet_loss": round(pkt, 3),
        "uptime": round(upt, 2),
    }

# ─── Routes ──────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    # Now serving the index.html file from the templates folder
    return render_template("index.html")

@app.route("/api/metrics")
def metrics():
    return jsonify([{**t, **simulate_metrics(t)} for t in TOWERS])

@app.route("/api/tower/<tower_id>")
def tower_detail(tower_id):
    tower = next((t for t in TOWERS if t["id"] == tower_id), None)
    if not tower:
        return jsonify({"error": "not found"}), 404
    return jsonify({**tower, **simulate_metrics(tower)})

if __name__ == "__main__":
    app.run(debug=True, port=5001)