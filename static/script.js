// ─── Color Maps ──────────────────────────────────────────────────────────────
const BC = { n78: "#00f5d4", mmWave: "#ff6b35", n41: "#9b5de5" };
const SC = { active: "#00f5d4", degraded: "#f7c059", offline: "#ff3d5a" };
const OC = {
  Jio: "#0070ff",
  Airtel: "#ef233c",
  Vi: "#8e44ad",
  BSNL: "#f39c12",
};

// ─── State ────────────────────────────────────────────────────────────────────
let metrics = {};
let history = {};
let selectedId = null;
let activeFilter = "all";
let searchQuery = "";

// ─── Clock ────────────────────────────────────────────────────────────────────
setInterval(() => {
  const now = new Date();
  document.getElementById("clock").textContent =
    now.toISOString().replace("T", " ").slice(0, 19) + " IST";
}, 1000);

// ─── Search listener ──────────────────────────────────────────────────────────
document.getElementById("search").addEventListener("input", function () {
  searchQuery = this.value.toLowerCase().trim();
  renderList();
});
const API_BASE_URL = window.location.origin.includes("localhost")
  ? "http://localhost:5001" // Local development
  : "https://fiveg-monitering-system-3.onrender.com/"; // Replace with your live backend URL
// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchMetrics() {
  try {
    // Use the dynamic API_BASE_URL
    const response = await fetch(`${API_BASE_URL}/api/metrics`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    data.forEach((tower) => {
      metrics[tower.id] = tower;
      if (!history[tower.id]) history[tower.id] = { tp: [], lat: [] };
      history[tower.id].tp.push(tower.throughput);
      history[tower.id].lat.push(tower.latency);
      if (history[tower.id].tp.length > 40) {
        history[tower.id].tp.shift();
        history[tower.id].lat.shift();
      }
    });

    // Update header counts
    const all = Object.values(metrics);
    document.getElementById("count-active").textContent = all.filter(
      (t) => t.status === "active"
    ).length;
    document.getElementById("count-degraded").textContent = all.filter(
      (t) => t.status === "degraded"
    ).length;
    document.getElementById("count-offline").textContent = all.filter(
      (t) => t.status === "offline"
    ).length;

    renderList();
    if (selectedId) renderDetail(selectedId);
  } catch (err) {
    console.error("Fetch error:", err);
    document.getElementById(
      "detail"
    ).innerHTML = `<div class="detail-empty" style="color:#ff3d5a">⚠ BACKEND OFFLINE<br><small style="font-size:10px;margin-top:8px;display:block">Start backend.py then refresh</small></div>`;
  }
}

// ─── Render Tower List ────────────────────────────────────────────────────────
function renderList() {
  const towerList = document.getElementById("tower-list");
  towerList.innerHTML = "";

  const towers = Object.values(metrics).filter((tower) => {
    // Status / type filter
    if (
      activeFilter === "active" ||
      activeFilter === "degraded" ||
      activeFilter === "offline"
    ) {
      if (tower.status !== activeFilter) return false;
    }
    // FIX: use is_ut boolean from backend instead of string check
    if (activeFilter === "state" && tower.is_ut) return false;
    if (activeFilter === "ut" && !tower.is_ut) return false;

    // Search filter
    if (searchQuery) {
      const hay =
        `${tower.name} ${tower.city} ${tower.operator} ${tower.band}`.toLowerCase();
      if (!hay.includes(searchQuery)) return false;
    }
    return true;
  });

  document.getElementById("tower-count").textContent = towers.length;

  if (towers.length === 0) {
    towerList.innerHTML =
      '<div style="color:var(--muted);font-size:11px;text-align:center;padding:20px;">No towers match filter</div>';
    return;
  }

  towers.forEach((tower) => {
    const card = document.createElement("div");
    card.className = `tower-card ${selectedId === tower.id ? "selected" : ""}`;
    card.onclick = () => {
      selectedId = tower.id;
      renderList(); // re-render to update selected highlight
      renderDetail(tower.id);
    };

    const h = history[tower.id];
    const sparkData = h ? h.tp : [];
    const sparkSvg = sparkline(sparkData, SC[tower.status]);

    card.innerHTML = `
            <div class="status-bar" style="background:${
              SC[tower.status]
            }"></div>
            <div class="card-top">
                <div>
                    <div class="card-name">${tower.name}</div>
                    <div class="card-city">${tower.city}</div>
                </div>
                <div class="badges">
                    <div class="badge" style="background:${
                      OC[tower.operator] || "#555"
                    }">${tower.operator}</div>
                    <div class="badge" style="background:${
                      BC[tower.band] || "#555"
                    }">${tower.band}</div>
                </div>
            </div>
            <div class="card-metrics">
                <span class="metric-chip">${
                  tower.throughput > 0 ? tower.throughput + " Mb" : "—"
                }</span>
                <span class="metric-chip">${
                  tower.latency > 0 ? tower.latency + " ms" : "—"
                }</span>
                <span class="metric-chip">${
                  tower.connected_devices > 0
                    ? tower.connected_devices + " dev"
                    : "—"
                }</span>
            </div>
            <div class="card-spark">${sparkSvg}</div>
        `;
    towerList.appendChild(card);
  });
}

// ─── Sparkline SVG generator ──────────────────────────────────────────────────
function sparkline(data, color = "#00f5d4", w = 250, h = 24) {
  if (!data || data.length < 2) return `<svg width="${w}" height="${h}"></svg>`;
  const max = Math.max(...data) || 1;
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
        <polyline points="${pts.join(
          " "
        )}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.7"/>
    </svg>`;
}

// ─── Render Detail Panel ──────────────────────────────────────────────────────
function renderDetail(towerId) {
  selectedId = towerId;
  const detail = document.getElementById("detail");
  const tower = metrics[towerId];
  if (!tower) {
    detail.innerHTML = '<div class="detail-empty">Tower data unavailable</div>';
    return;
  }

  const h = history[towerId] || { tp: [], lat: [] };
  const statusColor = SC[tower.status];
  const bandColor = BC[tower.band] || "#fff";
  const opColor = OC[tower.operator] || "#fff";

  const tpSvg = sparkline(h.tp, statusColor, 340, 48);
  const latSvg = sparkline(h.lat, "#f7c059", 340, 48);

  const signalPct =
    tower.status === "offline"
      ? 0
      : Math.min(100, Math.max(0, ((tower.signal_strength + 120) / 50) * 100));
  const uptimePct = tower.uptime;

  detail.innerHTML = `
        <div class="dt-header">
            <div class="dt-status-pill" style="background:${statusColor}20;border:1px solid ${statusColor};color:${statusColor}">
                ● ${tower.status.toUpperCase()}
            </div>
            <div class="dt-title">${tower.name}</div>
            <div class="dt-subtitle">${tower.city} · ${tower.id}</div>
            <div class="dt-badges">
                <span class="badge" style="background:${opColor};font-size:10px;padding:3px 10px">${
    tower.operator
  }</span>
                <span class="badge" style="background:${bandColor};font-size:10px;padding:3px 10px">${
    tower.band
  }</span>
                <span class="badge" style="background:#1a2035;border:1px solid var(--border);font-size:10px;padding:3px 10px">${
                  tower.is_ut ? "UNION TERRITORY" : "STATE"
                }</span>
            </div>
        </div>

        <div class="dt-grid">
            <div class="dt-card">
                <div class="dt-card-label">THROUGHPUT</div>
                <div class="dt-card-value" style="color:${statusColor}">${
    tower.throughput
  }<span class="dt-unit">Mbps</span></div>
                <div class="dt-spark">${tpSvg}</div>
            </div>
            <div class="dt-card">
                <div class="dt-card-label">LATENCY</div>
                <div class="dt-card-value" style="color:#f7c059">${
                  tower.latency
                }<span class="dt-unit">ms</span></div>
                <div class="dt-spark">${latSvg}</div>
            </div>
        </div>

        <div class="dt-stats">
            <div class="dt-stat">
                <div class="dt-stat-label">SIGNAL STRENGTH</div>
                <div class="dt-stat-value">${
                  tower.signal_strength
                } <span class="dt-unit">dBm</span></div>
                <div class="dt-bar-bg"><div class="dt-bar-fill" style="width:${signalPct}%;background:${statusColor}"></div></div>
            </div>
            <div class="dt-stat">
                <div class="dt-stat-label">UPTIME</div>
                <div class="dt-stat-value">${
                  tower.uptime
                } <span class="dt-unit">%</span></div>
                <div class="dt-bar-bg"><div class="dt-bar-fill" style="width:${uptimePct}%;background:${
    uptimePct > 95 ? "#00f5d4" : uptimePct > 80 ? "#f7c059" : "#ff3d5a"
  }"></div></div>
            </div>
            <div class="dt-stat">
                <div class="dt-stat-label">CONNECTED DEVICES</div>
                <div class="dt-stat-value">${tower.connected_devices.toLocaleString()}</div>
            </div>
            <div class="dt-stat">
                <div class="dt-stat-label">PACKET LOSS</div>
                <div class="dt-stat-value" style="color:${
                  tower.packet_loss > 5
                    ? "#ff3d5a"
                    : tower.packet_loss > 1
                    ? "#f7c059"
                    : "#00f5d4"
                }">${tower.packet_loss} <span class="dt-unit">%</span></div>
            </div>
        </div>
    `;
}

// ─── Filter ───────────────────────────────────────────────────────────────────
function setFilter(filter, button) {
  activeFilter = filter;
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  button.classList.add("active");
  renderList();
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
fetchMetrics();
setInterval(fetchMetrics, 15000);

