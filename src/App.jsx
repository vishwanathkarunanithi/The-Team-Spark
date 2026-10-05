import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polyline, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import {
  Database,
  Layers,
  BrainCircuit,
  Scale,
  GitFork,
  Cpu,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
  Search,
  Download,
  RefreshCw,
  ExternalLink,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Award,
  TrendingUp,
  Zap,
  Eye,
  X,
  Check,
  Users,
  Compass,
  Radio,
  Sun,
  Moon,
  Bell,
  SlidersHorizontal,
  FolderKanban,
  FileSpreadsheet,
  Settings,
  UserCheck
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  ChartTooltip,
  Legend
);

// Map Basemaps (including Google Maps Satellite, Streets, Terrain)
const BASEMAPS = {
  googleHybrid: {
    id: 'googleHybrid',
    name: 'Google Satellite (Hybrid)',
    icon: '🛰️',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: 'Map &copy; Google Maps Hybrid'
  },
  googleStreets: {
    id: 'googleStreets',
    name: 'Google Maps (Roads)',
    icon: '🗺️',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: 'Map &copy; Google Maps Streets'
  },
  esriDark: {
    id: 'esriDark',
    name: 'Esri Dark Canvas',
    icon: '🌙',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  }
};

// National Projects
const PROJECTS = [
  { id: 'mahsr', name: 'Mumbai-Ahmedabad Bullet Train (MAHSR - C4)', region: 'Western Corridor', center: [20.2000, 72.8500], zoom: 9 },
  { id: 'dmic', name: 'Delhi-Mumbai Industrial Corridor (DMIC)', region: 'National Master Plan', center: [23.5000, 73.2000], zoom: 7 },
  { id: 'cbic', name: 'Chennai-Bengaluru Industrial Corridor', region: 'Southern Node', center: [12.9716, 79.1585], zoom: 8 }
];

// Corridor Alignment Polylines
const CORRIDOR_ALIGNMENT = [
  [19.0657, 72.8687], // Mumbai BKC
  [19.1860, 72.9759], // Thane
  [19.6967, 72.7699], // Palghar / Virar
  [20.3718, 72.9043], // Vapi
  [20.9467, 72.9520], // Navsari
  [21.1702, 72.8311], // Surat
  [21.7051, 72.9959], // Bharuch
  [22.3072, 73.1812], // Vadodara
  [23.0805, 72.5850]  // Ahmedabad
];

// Glowing Parcels on the map (Matching the reference layout)
const INITIAL_PARCELS = [
  { id: 'P784', label: '#P784: Negotiation', ulpin: 'MH-27-P784-9021', owner: 'Rameshwar Patil & Co', status: 'negotiation', stage: 'Sec 19 Notice', areaAcres: 48.5, delayRisk: 68, costCr: 4.28, color: '#eab308', lat: 19.6967, lng: 72.7699 },
  { id: 'P912', label: '#P912: Closed', ulpin: 'MH-27-P912-8834', owner: 'Sunita Devi (Acquired)', status: 'closed', stage: 'Sec 38 Possession', areaAcres: 31.0, delayRisk: 8, costCr: 2.20, color: '#10b981', lat: 19.7400, lng: 72.9100 },
  { id: 'P235', label: '#P235: Dispute', ulpin: 'MH-27-P235-4102', owner: 'Gram Panchayat Kelwe', status: 'dispute', stage: 'Sec 11 Preliminary', areaAcres: 122.0, delayRisk: 82, costCr: 7.00, color: '#f97316', lat: 19.6200, lng: 72.7300 },
  { id: 'P104', label: '#P104: Discovery', ulpin: 'MH-27-P104-1290', owner: 'Maharashtra Agro Corp', status: 'discovery', stage: 'JMS Cadastre Survey', areaAcres: 185.0, delayRisk: 24, costCr: 19.60, color: '#06b6d4', lat: 19.8000, lng: 72.7550 },
  { id: 'P502', label: '#P502: Permitting', ulpin: 'GJ-24-P502-3310', owner: 'Bhupendra Patel & Sons', status: 'permitting', stage: 'Sec 15 Hearing', areaAcres: 84.0, delayRisk: 45, costCr: 12.40, color: '#8b5cf6', lat: 20.3718, lng: 72.9043 },
  { id: 'P580', label: '#P580: Closed', ulpin: 'GJ-24-P580-9941', owner: 'Railway Land Bank Hub', status: 'closed', stage: 'Possession Handover', areaAcres: 140.0, delayRisk: 2, costCr: 30.00, color: '#10b981', lat: 21.1702, lng: 72.8311 }
];

// Helper to smoothly fly map
function MapFlyController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function App() {
  const [theme, setTheme] = useState('white'); // 'white' or 'dark'
  const [activeRailTab, setActiveRailTab] = useState('map'); // 'map', 'search', 'data', 'reports', 'grievances', 'security'
  const [selectedProjectId, setSelectedProjectId] = useState('mahsr');
  const [currentBasemap, setCurrentBasemap] = useState('googleHybrid');
  const [parcels, setParcels] = useState(INITIAL_PARCELS);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [showLayersDropdown, setShowLayersDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [glowingTab, setGlowingTab] = useState('id'); // 'id', 'status', 'owner', 'size'
  const [toastMessage, setToastMessage] = useState(null);

  // Sync theme class to body
  useEffect(() => {
    document.body.className = theme === 'white' ? 'theme-white' : 'theme-dark';
  }, [theme]);

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentProject = useMemo(() => {
    return PROJECTS.find(p => p.id === selectedProjectId) || PROJECTS[0];
  }, [selectedProjectId]);

  const [mapCenter, setMapCenter] = useState(currentProject.center);
  const [mapZoom, setMapZoom] = useState(currentProject.zoom);

  // Handle Project Change
  const handleProjectSelect = (id) => {
    setSelectedProjectId(id);
    const p = PROJECTS.find(item => item.id === id);
    if (p) {
      setMapCenter(p.center);
      setMapZoom(p.zoom);
      showToast(`📍 Switched to Corridor: ${p.name}`);
    }
  };

  // GeoJSON features for glowing parcels
  const geoJsonData = useMemo(() => {
    const features = parcels.map(p => {
      const size = 0.025;
      return {
        type: "Feature",
        properties: { ...p },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [p.lng - size, p.lat - size],
            [p.lng + size, p.lat - size],
            [p.lng + size * 1.2, p.lat + size],
            [p.lng - size * 0.8, p.lat + size * 1.1],
            [p.lng - size, p.lat - size]
          ]]
        }
      };
    });
    return { type: "FeatureCollection", features };
  }, [parcels]);

  // Doughnut Chart data for Right Column Acquisition Stage (Matching image)
  const donutChartData = {
    labels: ['Discovery', 'Negotiation', 'Due Diligence', 'Permitting', 'Closed'],
    datasets: [{
      data: [15, 30, 21, 7, 27],
      backgroundColor: ['#06b6d4', '#eab308', '#f97316', '#8b5cf6', '#10b981'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  // Bar Chart data for Left Column Risk Factors (Matching image)
  const riskFactorsBarData = {
    labels: ['Title Issues', 'Environmental', 'Permitting', 'Owner Non-Comp'],
    datasets: [{
      data: [75, 50, 40, 20],
      backgroundColor: ['#06b6d4', '#10b981', '#a3e635', '#eab308'],
      borderRadius: 4,
      barThickness: 16
    }]
  };

  // Line Chart data for Monthly Risk Trend (Matching image)
  const riskTrendLineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Risk Score',
      data: [6, 12, 9, 14, 11, 15, 17, 13, 16, 19],
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, 0.15)',
      fill: true,
      tension: 0.4,
      pointRadius: 2,
      borderWidth: 2
    }]
  };

  return (
    <div className="geoportal-container">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div style={{position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 3000, background: 'var(--bg-card)', border: '1px solid var(--accent-cyan)', padding: '0.75rem 1.25rem', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-primary)'}}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEFT VERTICAL NAVIGATION RAIL (MATCHING SCREENSHOT)                        */}
      {/* ========================================================================= */}
      <aside className="vertical-nav-rail">
        <div className="rail-logo-icon" onClick={() => showToast("Bhoomi Sethu AI - National Decision Geoportal")}>
          <Database size={20} color="#ffffff" />
        </div>

        <div className="rail-menu">
          <button 
            className={`rail-item ${activeRailTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveRailTab('map')}
            title="Geoportal Map"
          >
            <Compass size={18} />
            <span>Map</span>
          </button>

          <button 
            className={`rail-item ${activeRailTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveRailTab('search')}
            title="Search & ULPIN Cadastre"
          >
            <Search size={18} />
            <span>Search</span>
          </button>

          <button 
            className={`rail-item ${activeRailTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveRailTab('data')}
            title="Land Parcels Data"
          >
            <FileSpreadsheet size={18} />
            <span>Data</span>
          </button>

          <button 
            className={`rail-item ${activeRailTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveRailTab('reports')}
            title="Statutory Reports & DBT"
          >
            <Activity size={18} />
            <span>Reports</span>
          </button>

          <button 
            className={`rail-item ${activeRailTab === 'grievances' ? 'active' : ''}`}
            onClick={() => setActiveRailTab('grievances')}
            title="NLP Grievances"
          >
            <Scale size={18} />
            <span>Disputes</span>
          </button>

          <button 
            className={`rail-item ${activeRailTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveRailTab('security')}
            title="Zero-Trust Audit Vault"
          >
            <Lock size={18} />
            <span>Security</span>
          </button>
        </div>

        <div className="rail-footer">
          <button className="rail-item" onClick={() => showToast("Role: District Collector (Adjudication Authority)")} title="Profile">
            <UserCheck size={18} />
            <span>Profile</span>
          </button>
          <button className="rail-item" onClick={() => showToast("Settings: AES-256 Enabled, TLS 1.3 Active")} title="Settings">
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* APP VIEWPORT RIGHT OF RAIL                                               */}
      {/* ========================================================================= */}
      <div className="app-viewport">

        {/* TOP HEADER BAR (MATCHING SCREENSHOT) */}
        <header className="top-header-bar">
          <div className="header-left-title">
            <h2>LAND ACQUISITION <span>GEOPORTAL</span></h2>
          </div>

          <div className="header-center-controls">
            {/* Search Box */}
            <div className="header-search-box">
              <Search size={14} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search parcels, owners, coordinates..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Action Pills (Layers, Legend, Analysis) */}
            <div style={{position: 'relative'}}>
              <button 
                className={`pill-action-btn ${showLayersDropdown ? 'active' : ''}`}
                onClick={() => setShowLayersDropdown(!showLayersDropdown)}
              >
                <Layers size={14} /> Layers
              </button>

              {/* Layers Dropdown */}
              {showLayersDropdown && (
                <div style={{position: 'absolute', top: '110%', left: 0, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.5rem', boxShadow: 'var(--card-shadow)', zIndex: 1200, width: '210px'}}>
                  <div style={{fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', padding: '0.2rem 0.4rem'}}>Basemap Provider</div>
                  {Object.values(BASEMAPS).map(bm => (
                    <button
                      key={bm.id}
                      onClick={() => {
                        setCurrentBasemap(bm.id);
                        setShowLayersDropdown(false);
                        showToast(`Switched Basemap: ${bm.name}`);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.45rem 0.6rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: currentBasemap === bm.id ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                        color: currentBasemap === bm.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span>{bm.icon}</span>
                      <span>{bm.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="pill-action-btn" onClick={() => showToast("Legend: Yellow = Negotiation, Green = Closed, Orange = Dispute, Cyan = Discovery")}>
              <SlidersHorizontal size={14} /> Legend
            </button>

            <button className="pill-action-btn" onClick={() => showToast("AI Spatial Delay Analysis: 87% Accuracy Model Active")}>
              <Activity size={14} /> Analysis
            </button>
          </div>

          <div className="header-right-controls">
            {/* White UI / Dark Mode Toggle */}
            <button 
              className="theme-toggle-btn"
              onClick={() => {
                const next = theme === 'white' ? 'dark' : 'white';
                setTheme(next);
                showToast(`Switched to: ${next === 'white' ? '☀️ Professional White UI' : '🌙 Cyber Geoportal Dark'}`);
              }}
            >
              {theme === 'white' ? <Moon size={14} /> : <Sun size={14} />}
              <span>{theme === 'white' ? 'Dark Mode' : 'White UI'}</span>
            </button>

            {/* Project Corridor Dropdown */}
            <select 
              className="project-select-header"
              value={selectedProjectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
            >
              {PROJECTS.map(p => (
                <option key={p.id} value={p.id}>Project: {p.name}</option>
              ))}
            </select>

            {/* Bell Alert */}
            <div style={{position: 'relative', cursor: 'pointer'}} onClick={() => showToast("3 Critical Grievances Awaiting Collector Sign-off")}>
              <Bell size={18} color="var(--text-secondary)" />
              <span style={{position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981'}}></span>
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* MAIN BODY: 3-COLUMN GEOPORTAL (MATCHING SCREENSHOT)                        */}
        {/* ========================================================================= */}
        {activeRailTab === 'map' && (
          <div className="geoportal-main-grid">

            {/* --------------------------------------------------------------------- */}
            {/* LEFT COLUMN: ACQUISITION SUMMARY & AI DELAY RISK PREDICTION           */}
            {/* --------------------------------------------------------------------- */}
            <div className="stat-panel-column">
              {/* Card 1: ACQUISITION SUMMARY */}
              <div className="portal-card">
                <div className="card-header-row">
                  <span className="card-title">Acquisition Summary</span>
                  <Activity size={14} color="var(--text-muted)" />
                </div>
                <div className="card-kpi-grid">
                  <div className="kpi-tile">
                    <div className="kpi-label">Total Parcels</div>
                    <div className="kpi-value">148</div>
                  </div>
                  <div className="kpi-tile">
                    <div className="kpi-label">Active</div>
                    <div className="kpi-value green">64</div>
                  </div>
                  <div className="kpi-tile">
                    <div className="kpi-label">Pending</div>
                    <div className="kpi-value yellow">32</div>
                  </div>
                  <div className="kpi-tile">
                    <div className="kpi-label">Target Area</div>
                    <div className="kpi-value cyan" style={{fontSize: '1.15rem'}}>12,450 <span style={{fontSize: '0.65rem', color: 'var(--text-muted)'}}>ACRES</span></div>
                  </div>
                </div>
              </div>

              {/* Card 2: AI DELAY RISK PREDICTION (Speedometer, Bar, Line) */}
              <div className="portal-card" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                <div className="card-header-row" style={{marginBottom: '0.25rem'}}>
                  <span className="card-title">AI Delay Risk Prediction</span>
                  <BrainCircuit size={14} color="var(--accent-cyan)" />
                </div>
                <div style={{fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.6rem'}}>
                  A high-tech risk selected area (RFCTLARR Sec 19)
                </div>

                {/* Speedometer Gauge Canvas */}
                <div className="speedometer-container" style={{height: '110px'}}>
                  <Doughnut 
                    data={{
                      datasets: [{
                        data: [68, 32],
                        backgroundColor: ['#f97316', theme === 'white' ? '#e2e8f0' : '#1f293d'],
                        borderWidth: 0,
                        circumference: 180,
                        rotation: 270
                      }]
                    }}
                    options={{ cutout: '78%', maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                  />
                  <div style={{position: 'absolute', top: '48%', textAlign: 'center'}}>
                    <div style={{fontSize: '1.6rem', fontWeight: '800', color: '#f97316', lineHeight: 1}}>68%</div>
                    <div style={{fontSize: '0.7rem', fontWeight: '700', color: '#ef4444'}}>High Risk</div>
                  </div>
                </div>

                {/* Risk Factors Bar Chart */}
                <div style={{marginTop: '0.5rem'}}>
                  <div style={{fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.35rem'}}>
                    Risk Factors
                  </div>
                  <div style={{height: '80px'}}>
                    <Bar 
                      data={riskFactorsBarData} 
                      options={{
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { grid: { display: false }, ticks: { font: { size: 8 }, color: 'var(--text-muted)' } },
                          y: { display: false, max: 100 }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Risk Score Trend Line Chart */}
                <div style={{marginTop: '0.6rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.35rem'}}>
                    <span>Risk Score</span>
                    <span style={{color: 'var(--accent-cyan)', fontSize: '0.65rem'}}>— Risks  -- Point</span>
                  </div>
                  <div style={{height: '75px'}}>
                    <Line 
                      data={riskTrendLineData}
                      options={{
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { grid: { display: false }, ticks: { font: { size: 7 }, color: 'var(--text-muted)' } },
                          y: { display: false }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* CENTER COLUMN: HERO MAP WITH GLOWING NEON PARCELS                     */}
            {/* --------------------------------------------------------------------- */}
            <div className="center-map-container">
              {/* Floating Header: GLOWING PARCELS */}
              <div className="glowing-parcels-floating-header">
                <div className="glowing-parcels-left">
                  <span className="glowing-title">Glowing Parcels</span>
                  <div className="glowing-tabs-pills">
                    <button className={`mini-tab-pill ${glowingTab === 'id' ? 'active' : ''}`} onClick={() => setGlowingTab('id')}>Parcel ID</button>
                    <button className={`mini-tab-pill ${glowingTab === 'status' ? 'active' : ''}`} onClick={() => setGlowingTab('status')}>Status</button>
                    <button className={`mini-tab-pill ${glowingTab === 'owner' ? 'active' : ''}`} onClick={() => setGlowingTab('owner')}>Owner</button>
                    <button className={`mini-tab-pill ${glowingTab === 'size' ? 'active' : ''}`} onClick={() => setGlowingTab('size')}>Size</button>
                  </div>
                </div>

                <div className="glowing-parcels-right">
                  <button className="mini-tab-pill" onClick={() => showToast("Filters: Showing Active Corridors")}>
                    <Sliders size={12} /> Filters
                  </button>
                  <button className="mini-tab-pill" style={{color: '#ef4444', borderColor: '#ef4444'}} onClick={() => showToast("Alert: 3 Parcels Exceeding Ready Reckoner Circle Rates")}>
                    ⚠️ Alert
                  </button>
                  <button className="mini-tab-pill active">
                    📍 {currentProject.region}
                  </button>
                </div>
              </div>

              {/* Leaflet Map with Google Maps Hybrid / Streets Tiles */}
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                minZoom={3}
                maxZoom={19}
                style={{ height: '100%', width: '100%', background: theme === 'white' ? '#e2e8f0' : '#070d18' }}
                zoomControl={false}
              >
                <MapFlyController center={mapCenter} zoom={mapZoom} />

                {/* Basemap Tile Layer */}
                <TileLayer
                  key={currentBasemap}
                  url={BASEMAPS[currentBasemap].url}
                  attribution={BASEMAPS[currentBasemap].attribution}
                  maxZoom={19}
                />

                {/* Infrastructure Corridor Polyline */}
                <Polyline
                  positions={CORRIDOR_ALIGNMENT}
                  pathOptions={{
                    color: '#06b6d4',
                    weight: 4,
                    opacity: 0.9,
                    dashArray: '8, 6'
                  }}
                />

                {/* Glowing Parcels (Polygons) */}
                <GeoJSON
                  key={`${JSON.stringify(parcels)}-${theme}-${currentBasemap}`}
                  data={geoJsonData}
                  style={(feature) => ({
                    color: feature.properties.color,
                    weight: selectedParcel?.id === feature.properties.id ? 4 : 2.5,
                    fillOpacity: selectedParcel?.id === feature.properties.id ? 0.6 : 0.35,
                    fillColor: feature.properties.color,
                    dashArray: feature.properties.status === 'dispute' ? '6, 6' : null
                  })}
                  onEachFeature={(feature, layer) => {
                    layer.on({
                      click: () => {
                        setSelectedParcel(feature.properties);
                        showToast(`Inspecting: ${feature.properties.label} (${feature.properties.owner})`);
                      }
                    });
                    layer.bindTooltip(
                      `<b>${feature.properties.label}</b><br/>Owner: ${feature.properties.owner}<br/>Area: ${feature.properties.areaAcres} Acres<br/>Award: ₹${feature.properties.costCr} Cr`,
                      { permanent: true, direction: 'center', className: 'glowing-map-label' }
                    );
                  }}
                />
              </MapContainer>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* RIGHT COLUMN: ACQUISITION STAGE, GANTT TIMELINE & TASK KANBAN         */}
            {/* --------------------------------------------------------------------- */}
            <div className="stat-panel-column">
              {/* Card 1: ACQUISITION STAGE (Donut Ring Chart) */}
              <div className="portal-card">
                <div className="card-header-row">
                  <span className="card-title">Acquisition Stage</span>
                  <Award size={14} color="var(--accent-cyan)" />
                </div>
                <div style={{height: '130px', position: 'relative'}}>
                  <Doughnut 
                    data={donutChartData} 
                    options={{ cutout: '68%', maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                  />
                </div>
                <div style={{marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.72rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}><span style={{width: 8, height: 8, borderRadius: '50%', background: '#06b6d4'}}></span> Discovery</span>
                    <span style={{fontWeight: '700', color: 'var(--text-primary)'}}>15%</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}><span style={{width: 8, height: 8, borderRadius: '50%', background: '#eab308'}}></span> Negotiation</span>
                    <span style={{fontWeight: '700', color: 'var(--text-primary)'}}>30%</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}><span style={{width: 8, height: 8, borderRadius: '50%', background: '#f97316'}}></span> Due Diligence</span>
                    <span style={{fontWeight: '700', color: 'var(--text-primary)'}}>21%</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}><span style={{width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6'}}></span> Permitting</span>
                    <span style={{fontWeight: '700', color: 'var(--text-primary)'}}>7%</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}><span style={{width: 8, height: 8, borderRadius: '50%', background: '#10b981'}}></span> Closed / Acquired</span>
                    <span style={{fontWeight: '700', color: 'var(--text-primary)'}}>27%</span>
                  </div>
                </div>
              </div>

              {/* Card 2: PROJECT TIMELINE (Gantt Chart Bars from image) */}
              <div className="portal-card">
                <div className="card-header-row">
                  <span className="card-title">Project Timeline</span>
                  <ClockIcon size={14} />
                </div>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.3rem'}}>
                  <span>1h</span><span>2h</span><span>6h</span><span>1w</span><span>1m</span>
                </div>
                <div className="gantt-timeline-container">
                  <div className="gantt-row">
                    <span className="gantt-label">Period 1</span>
                    <div className="gantt-track">
                      <div className="gantt-bar" style={{left: '10%', width: '45%', background: '#06b6d4'}}></div>
                    </div>
                  </div>
                  <div className="gantt-row">
                    <span className="gantt-label">Period 2</span>
                    <div className="gantt-track">
                      <div className="gantt-bar" style={{left: '35%', width: '55%', background: '#10b981'}}></div>
                    </div>
                  </div>
                  <div className="gantt-row">
                    <span className="gantt-label">Period 3</span>
                    <div className="gantt-track">
                      <div className="gantt-bar" style={{left: '50%', width: '40%', background: '#06b6d4'}}></div>
                    </div>
                  </div>
                  <div className="gantt-row">
                    <span className="gantt-label">Period 4</span>
                    <div className="gantt-track">
                      <div className="gantt-bar" style={{left: '70%', width: '25%', background: '#eab308'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: TASK STATUS (Kanban Cards from image) */}
              <div className="portal-card" style={{flex: 1}}>
                <div className="card-header-row">
                  <span className="card-title">Task Status</span>
                  <FolderKanban size={14} color="var(--text-muted)" />
                </div>
                <div className="kanban-tab-row">
                  <span className="kanban-pill active">Kanban</span>
                  <span className="kanban-pill">Pending</span>
                  <span className="kanban-pill">Review</span>
                </div>
                <div className="kanban-tasks-grid">
                  <div className="kanban-item-card">
                    <div>
                      <div style={{fontWeight: '700', color: 'var(--text-primary)'}}>Negotiation Status</div>
                      <div style={{fontSize: '0.68rem', color: 'var(--text-muted)'}}>Parcel #P784 • Hearing ordered</div>
                    </div>
                    <span style={{color: '#eab308', fontWeight: '800'}}>42%</span>
                  </div>
                  <div className="kanban-item-card">
                    <div>
                      <div style={{fontWeight: '700', color: 'var(--text-primary)'}}>Owner Non-Comp</div>
                      <div style={{fontSize: '0.68rem', color: 'var(--text-muted)'}}>Parcel #P235 • Circle Rate</div>
                    </div>
                    <span style={{color: '#f97316', fontWeight: '800'}}>18%</span>
                  </div>
                  <div className="kanban-item-card">
                    <div>
                      <div style={{fontWeight: '700', color: 'var(--text-primary)'}}>Resolution Overdue</div>
                      <div style={{fontSize: '0.68rem', color: 'var(--text-muted)'}}>District Collector File #75</div>
                    </div>
                    <span style={{color: '#ef4444', fontWeight: '800'}}>CRITICAL</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 2: DATA & CADASTRE REGISTRY                                       */}
        {/* ========================================================================= */}
        {activeRailTab === 'data' && (
          <div className="full-tab-viewport">
            <div className="portal-card">
              <div className="card-header-row">
                <span className="card-title" style={{fontSize: '0.9rem'}}>National Land Parcel Cadastre Registry</span>
                <span className="mini-tab-pill active">ULPIN Seeded</span>
              </div>
              <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem'}}>
                Centralized Land Bank synchronized across State Revenue Portals under the Digital India Land Records Modernization Programme (DILRMP).
              </p>
              <table className="clean-portal-table">
                <thead>
                  <tr>
                    <th>Parcel ID</th>
                    <th>ULPIN (Bhu-Aadhaar)</th>
                    <th>Landowner Name</th>
                    <th>Statutory Stage</th>
                    <th>Area (Acres)</th>
                    <th>Award Value</th>
                    <th>Delay Risk</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {parcels.map(p => (
                    <tr key={p.id}>
                      <td style={{fontWeight: '800', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)'}}>#{p.id}</td>
                      <td style={{fontFamily: 'var(--font-mono)', fontSize: '0.75rem'}}>{p.ulpin}</td>
                      <td style={{fontWeight: '600'}}>{p.owner}</td>
                      <td>
                        <span style={{padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', background: `${p.color}22`, color: p.color, border: `1px solid ${p.color}55`}}>
                          {p.stage}
                        </span>
                      </td>
                      <td>{p.areaAcres}</td>
                      <td style={{fontWeight: '700'}}>₹{p.costCr} Cr</td>
                      <td style={{fontWeight: '800', color: p.delayRisk > 60 ? '#ef4444' : '#10b981'}}>{p.delayRisk}%</td>
                      <td>
                        <button 
                          className="mini-tab-pill active"
                          onClick={() => {
                            setSelectedParcel(p);
                            setActiveRailTab('map');
                            showToast(`Located Parcel #${p.id} on Geoportal!`);
                          }}
                        >
                          View Map
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 3: SEARCH & ULPIN RESOLVER                                        */}
        {/* ========================================================================= */}
        {activeRailTab === 'search' && (
          <div className="full-tab-viewport">
            <div className="portal-card" style={{maxWidth: '800px', margin: '0 auto', width: '100%'}}>
              <div className="card-header-row">
                <span className="card-title" style={{fontSize: '0.9rem'}}>14-Digit ULPIN (Bhu-Aadhaar) Verification Gateway</span>
                <Cpu size={18} color="var(--accent-cyan)" />
              </div>
              <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem'}}>
                Query real-time spatial parcel polygons and verified owner mutation records directly from the National Land Registry API.
              </p>

              <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem'}}>
                <input 
                  type="text" 
                  defaultValue="MH-27-P784-9021" 
                  style={{flex: 1, padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.85rem'}}
                />
                <button 
                  className="pill-action-btn active"
                  style={{padding: '0.65rem 1.25rem'}}
                  onClick={() => showToast("✅ ULPIN MH-27-P784-9021 Verified: Palghar West, Maharashtra!")}
                >
                  <Search size={15} /> Resolve ULPIN
                </button>
              </div>

              <div style={{background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem'}}>
                  <span style={{fontWeight: '800', color: 'var(--accent-cyan)'}}>MH-27-P784-9021</span>
                  <span style={{fontSize: '0.75rem', color: '#10b981', fontWeight: '700'}}>● VERIFIED RECORD</span>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem'}}>
                  <div><span style={{color: 'var(--text-muted)'}}>Landowner:</span><br/><b>Rameshwar Patil & Brothers</b></div>
                  <div><span style={{color: 'var(--text-muted)'}}>Survey/Khasra:</span><br/><b>142/3A</b></div>
                  <div><span style={{color: 'var(--text-muted)'}}>Acquisition Corridor:</span><br/><b>Mumbai-Ahmedabad HSR (MAHSR C4)</b></div>
                  <div><span style={{color: 'var(--text-muted)'}}>Compensation Solatium:</span><br/><b>₹4.28 Crores (100% Solatium Granted)</b></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 4: REPORTS & STATUTORY LIFECYCLE                                  */}
        {/* ========================================================================= */}
        {activeRailTab === 'reports' && (
          <div className="full-tab-viewport">
            <div className="portal-card">
              <div className="card-header-row">
                <span className="card-title" style={{fontSize: '0.9rem'}}>LARR Act 2013 Statutory Progression Funnel</span>
                <span className="mini-tab-pill active">RFCTLARR Compliance</span>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem'}}>
                {[
                  { stage: 'Section 4 SIA', label: 'Social Impact Assessment', pct: '100%', count: '148 Parcels', color: '#06b6d4' },
                  { stage: 'Section 11', label: 'Preliminary Notification', pct: '94%', count: '139 Parcels', color: '#10b981' },
                  { stage: 'Section 19', label: 'Declaration of Acquisition', pct: '81%', count: '120 Parcels', color: '#eab308' },
                  { stage: 'Section 23/38', label: 'Award & Possession Handover', pct: '69%', count: '102 Parcels', color: '#3b82f6' }
                ].map(s => (
                  <div key={s.stage} style={{background: 'var(--bg-card-subtle)', borderTop: `4px solid ${s.color}`, borderRadius: '10px', padding: '1rem'}}>
                    <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)'}}>{s.stage}</div>
                    <div style={{fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-primary)', margin: '0.3rem 0'}}>{s.label}</div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem'}}>
                      <span style={{fontWeight: '800', color: s.color}}>{s.pct}</span>
                      <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{s.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 5: NLP GRIEVANCES & DISPUTES                                      */}
        {/* ========================================================================= */}
        {activeRailTab === 'grievances' && (
          <div className="full-tab-viewport">
            <div className="portal-card">
              <div className="card-header-row">
                <span className="card-title" style={{fontSize: '0.9rem'}}>NLP Auto-Classified Landowner Grievances</span>
                <Scale size={18} color="var(--accent-cyan)" />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem'}}>
                {[
                  { id: 'GRV-401', parcel: '#P784', title: 'Disputed Heirship & Title Partition', severity: 'CRITICAL', sentiment: '-0.85', status: 'Collector Hearing Scheduled' },
                  { id: 'GRV-388', parcel: '#P235', title: '18% Compensation Valuation Mismatch below Market Rate', severity: 'WARNING', sentiment: '-0.52', status: 'Ready Reckoner Audit' },
                  { id: 'GRV-374', parcel: '#P912', title: 'Unlinked 7/12 Land Extracts & Mutation Delay', severity: 'REVIEW', sentiment: '-0.25', status: 'Notice Dispatched' }
                ].map(g => (
                  <div key={g.id} style={{background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem'}}>
                        <span style={{fontFamily: 'var(--font-mono)', fontWeight: '800', color: 'var(--accent-cyan)', fontSize: '0.8rem'}}>{g.id}</span>
                        <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{g.parcel}</span>
                        <span style={{fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800', background: g.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)', color: g.severity === 'CRITICAL' ? '#ef4444' : '#eab308'}}>
                          {g.severity}
                        </span>
                      </div>
                      <div style={{fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)'}}>{g.title}</div>
                      <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem'}}>NLP Sentiment: {g.sentiment} (Adversarial) • Status: {g.status}</div>
                    </div>
                    <button 
                      className="pill-action-btn active"
                      onClick={() => showToast(`📜 Form E Legal Summons Auto-Generated for ${g.id}!`)}
                    >
                      Issue Summons
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 6: ZERO-TRUST SECURITY & AUDIT VAULT                             */}
        {/* ========================================================================= */}
        {activeRailTab === 'security' && (
          <div className="full-tab-viewport">
            <div className="portal-card">
              <div className="card-header-row">
                <span className="card-title" style={{fontSize: '0.9rem'}}>Cryptographic SHA-256 Tamper-Proof Audit Ledger</span>
                <Lock size={18} color="var(--accent-cyan)" />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem'}}>
                {[
                  { block: 48206, txn: 'PFMS DBT Direct Disbursement Approved', signatory: 'District Collector (DM-GJ-102)', amount: '₹12.40 Cr', hash: '0x8f2a1b9c44d7e8201fa877c449190d5' },
                  { block: 48205, txn: 'Section 38 Possession Handover Recorded', signatory: 'SLAO Gautam Buddha Nagar', amount: '₹48.00 Cr', hash: '0x6e41b9d033a887f19920ac4109d43ef1' },
                  { block: 48204, txn: 'PFMS Direct Disbursement Credited', signatory: 'District Collector (DM-MH-204)', amount: '₹19.60 Cr', hash: '0x7f8a3c9b21a8f94e63b01c72ea8910d5' }
                ].map(b => (
                  <div key={b.block} style={{background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem 1rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem'}}>
                      <span style={{fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#10b981', fontSize: '0.78rem'}}>BLOCK #{b.block}</span>
                      <span style={{fontSize: '0.72rem', color: '#10b981', fontWeight: '700'}}>● CRYPTOGRAPHICALLY VALID</span>
                    </div>
                    <div style={{fontWeight: '700', fontSize: '0.82rem', color: 'var(--text-primary)'}}>{b.txn}</div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem'}}>
                      <span>Signatory: <b>{b.signatory}</b></span>
                      <span>Disbursed: <b style={{color: '#10b981'}}>{b.amount}</b></span>
                    </div>
                    <div style={{fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      Hash: {b.hash}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Global Parcel Inspection Modal */}
      {selectedParcel && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500}} onClick={() => setSelectedParcel(null)}>
          <div style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '500px', boxShadow: 'var(--card-shadow)'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem'}}>
              <div>
                <span style={{fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)'}}>Parcel #{selectedParcel.id}</span>
                <span style={{marginLeft: '0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)'}}>{selectedParcel.ulpin}</span>
              </div>
              <button onClick={() => setSelectedParcel(null)} style={{background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'}}><X size={18} /></button>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.8rem', marginBottom: '1rem'}}>
              <div><span style={{color: 'var(--text-muted)'}}>Owner:</span><br/><b>{selectedParcel.owner}</b></div>
              <div><span style={{color: 'var(--text-muted)'}}>Stage:</span><br/><b style={{color: selectedParcel.color}}>{selectedParcel.stage}</b></div>
              <div><span style={{color: 'var(--text-muted)'}}>Area:</span><br/><b>{selectedParcel.areaAcres} Acres</b></div>
              <div><span style={{color: 'var(--text-muted)'}}>Total Award:</span><br/><b>₹{selectedParcel.costCr} Cr</b></div>
            </div>

            <button 
              className="pill-action-btn active"
              style={{width: '100%', justifyContent: 'center', padding: '0.65rem'}}
              onClick={() => {
                showToast(`🎉 Parcel #${selectedParcel.id} approved & forwarded to PFMS!`);
                setSelectedParcel(null);
              }}
            >
              Advance Stage & Disburse Award
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ClockIcon(props) {
  return (
    <svg width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--text-muted)'}}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
