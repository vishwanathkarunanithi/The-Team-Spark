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
  UserCheck,
  Clock,
  Trees,
  ScrollText,
  CreditCard,
  Network,
  Binary,
  Layers3,
  ChevronRight,
  Printer,
  FileCheck
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

// Map Basemaps
const BASEMAPS = {
  googleHybrid: { id: 'googleHybrid', name: 'Google Satellite (Hybrid)', icon: '🛰️', url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', attribution: 'Map &copy; Google Maps Hybrid' },
  googleStreets: { id: 'googleStreets', name: 'Google Maps (Roads)', icon: '🗺️', url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', attribution: 'Map &copy; Google Maps Streets' },
  esriDark: { id: 'esriDark', name: 'Esri Dark Canvas', icon: '🌙', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', attribution: 'Tiles &copy; Esri' }
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

// Rich Land Parcel Dataset
const INITIAL_PARCELS = [
  { id: 'P784', label: '#P784: Negotiation', ulpin: 'MH-27-P784-9021', surveyNo: '142/3A', owner: 'Rameshwar Patil & Co', village: 'Palghar West', status: 'negotiation', stage: 'Sec 19 Notice', areaAcres: 48.5, delayRisk: 68, costCr: 4.28, color: '#eab308', lat: 19.6967, lng: 72.7699 },
  { id: 'P912', label: '#P912: Closed', ulpin: 'MH-27-P912-8834', surveyNo: '204/B', owner: 'Sunita Devi (Acquired)', village: 'Manor Rural', status: 'closed', stage: 'Sec 38 Possession', areaAcres: 31.0, delayRisk: 8, costCr: 2.20, color: '#10b981', lat: 19.7400, lng: 72.9100 },
  { id: 'P235', label: '#P235: Dispute', ulpin: 'MH-27-P235-4102', surveyNo: '88/1', owner: 'Gram Panchayat Kelwe', village: 'Kelwe Node', status: 'dispute', stage: 'Sec 11 Preliminary', areaAcres: 122.0, delayRisk: 82, costCr: 7.00, color: '#f97316', lat: 19.6200, lng: 72.7300 },
  { id: 'P104', label: '#P104: Discovery', ulpin: 'MH-27-P104-1290', surveyNo: '12/4', owner: 'Maharashtra Agro Corp', village: 'Boisar Industrial Zone', status: 'discovery', stage: 'JMS Cadastre Survey', areaAcres: 185.0, delayRisk: 24, costCr: 19.60, color: '#06b6d4', lat: 19.8000, lng: 72.7550 },
  { id: 'P502', label: '#P502: Permitting', ulpin: 'GJ-24-P502-3310', surveyNo: '411/2', owner: 'Bhupendra Patel & Sons', village: 'Surat Terminal', status: 'permitting', stage: 'Sec 15 Hearing', areaAcres: 84.0, delayRisk: 45, costCr: 12.40, color: '#8b5cf6', lat: 20.3718, lng: 72.9043 },
  { id: 'P580', label: '#P580: Closed', ulpin: 'GJ-24-P580-9941', surveyNo: '62/3', owner: 'Railway Land Bank Hub', village: 'Sabarmati Yard', status: 'closed', stage: 'Possession Handover', areaAcres: 140.0, delayRisk: 2, costCr: 30.00, color: '#10b981', lat: 21.1702, lng: 72.8311 },
  { id: 'P610', label: '#P610: Negotiation', ulpin: 'GJ-07-P610-1123', surveyNo: '89/1B', owner: 'Dholera SIR Land Pool', village: 'Dholera Node', status: 'negotiation', stage: 'Sec 19 Notice', areaAcres: 240.0, delayRisk: 38, costCr: 42.50, color: '#eab308', lat: 22.2471, lng: 72.1932 },
  { id: 'P720', label: '#P720: Dispute', ulpin: 'RJ-02-P720-4491', surveyNo: '302/A', owner: 'Kisan Trust Neemrana', village: 'Neemrana Zone', status: 'dispute', stage: 'Sec 11 Preliminary', areaAcres: 64.0, delayRisk: 86, costCr: 15.60, color: '#f97316', lat: 27.9868, lng: 76.3828 }
];

// Categorized 16 Modules
const MODULE_CATEGORIES = [
  {
    category: 'GIS Command & Spatial',
    items: [
      { id: 'geoportal', label: '1. Geoportal GIS Center', icon: Compass, badge: 'Live Map' },
      { id: 'parcels', label: '2. Land Parcels Cadastre', icon: FileSpreadsheet, badge: 'Registry' },
      { id: 'ulpin', label: '3. ULPIN Bhu-Aadhaar', icon: Search, badge: '14-Digit' },
      { id: 'bhunaksha', label: '4. Bhu-Naksha Engine', icon: Layers3, badge: 'WGS84' },
      { id: 'gatishakti', label: '5. PM Gati Shakti Matrix', icon: Network, badge: '7-Engine' }
    ]
  },
  {
    category: 'AI & Decision Support',
    items: [
      { id: 'mldelay', label: '6. Delay Risk Simulator', icon: BrainCircuit, badge: '87% Acc' },
      { id: 'valuation', label: '7. Circle Rate Auditor', icon: TrendingUp, badge: '18% Anomaly' },
      { id: 'environment', label: '8. Forest & MoEFCC NOC', icon: Trees, badge: 'PARIVESH' }
    ]
  },
  {
    category: 'Statutory & Legal',
    items: [
      { id: 'lifecycle', label: '9. LARR 2013 Funnel', icon: GitFork, badge: '4-Stage' },
      { id: 'grievances', label: '10. NLP Dispute Triage', icon: Scale, badge: 'Summons' },
      { id: 'sia', label: '11. SIA & R&R Census', icon: ScrollText, badge: '412 PAFs' }
    ]
  },
  {
    category: 'Finance & Governance',
    items: [
      { id: 'dbt', label: '12. PFMS DBT Escrow', icon: CreditCard, badge: '₹1250 Cr' },
      { id: 'security', label: '13. SHA-256 Audit Vault', icon: Lock, badge: 'Ledger' },
      { id: 'rbac', label: '14. RBAC Roles Matrix', icon: Users, badge: '4-Tier' },
      { id: 'timeline', label: '15. Milestone Gantt', icon: Clock, badge: 'Critical' },
      { id: 'activity', label: '16. Live Telemetry Stream', icon: Radio, badge: 'Realtime' }
    ]
  }
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
  const [activeTab, setActiveTab] = useState('geoportal');
  const [selectedProjectId, setSelectedProjectId] = useState('mahsr');
  const [userRole, setUserRole] = useState('collector');
  const [currentBasemap, setCurrentBasemap] = useState('googleHybrid');
  const [parcels, setParcels] = useState(INITIAL_PARCELS);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [showLayersDropdown, setShowLayersDropdown] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [glowingTab, setGlowingTab] = useState('id');
  const [toastMessage, setToastMessage] = useState(null);

  // Deep ML Simulator Inputs (Module 6)
  const [simStage, setSimStage] = useState('Section 19');
  const [simLitigations, setSimLitigations] = useState(3);
  const [simValuationVariance, setSimValuationVariance] = useState(18);
  const [simForestClearance, setSimForestClearance] = useState('Pending');
  const [simCadastralMatch, setSimCadastralMatch] = useState('Discrepancy');
  const [simMutationDays, setSimMutationDays] = useState(45);

  // ULPIN Search State (Module 3)
  const [ulpinInput, setUlpinInput] = useState('MH-27-P784-9021');
  const [ulpinResult, setUlpinResult] = useState(null);

  // Valuation Ready Reckoner Calculator (Module 7)
  const [selectedVillageRate, setSelectedVillageRate] = useState('Palghar');

  // Legal Notice Form Modal (Module 10)
  const [showLegalNoticeModal, setShowLegalNoticeModal] = useState(false);
  const [activeNoticeCase, setActiveNoticeCase] = useState(null);

  // Sync theme to body
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

  const handleProjectSelect = (id) => {
    setSelectedProjectId(id);
    const p = PROJECTS.find(item => item.id === id);
    if (p) {
      setMapCenter(p.center);
      setMapZoom(p.zoom);
      showToast(`Corridor Activated: ${p.name}`);
    }
  };

  // ML Calculation
  const calculatedRisk = useMemo(() => {
    let score = 20;
    if (simStage === 'Section 19') score += 25;
    if (simStage === 'Section 11') score += 15;
    if (simStage === 'Award') score += 10;
    
    score += simLitigations * 12;
    score += Math.abs(simValuationVariance) * 0.9;
    if (simForestClearance === 'Pending') score += 20;
    if (simForestClearance === 'Contested') score += 32;
    if (simCadastralMatch === 'Discrepancy') score += 18;
    score += Math.min(15, Math.round(simMutationDays * 0.2));

    score = Math.min(98, Math.max(8, Math.round(score)));
    const slippage = (score * 0.055).toFixed(1);
    const escalation = (score * 0.42).toFixed(1);
    return { score, slippage, escalation };
  }, [simStage, simLitigations, simValuationVariance, simForestClearance, simCadastralMatch, simMutationDays]);

  // Export CSV Helper
  const handleExportCSV = () => {
    const headers = "Parcel ID,ULPIN,Survey No,Owner,Village,Status,Stage,Area (Acres),Compensation (Cr),Delay Risk (%)\n";
    const rows = parcels.map(p => `"${p.id}","${p.ulpin}","${p.surveyNo}","${p.owner}","${p.village}","${p.status}","${p.stage}",${p.areaAcres},${p.costCr},${p.delayRisk}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bhoomi_Sethu_Parcels_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast("📄 Exported National Land Parcel Registry to CSV!");
  };

  // GeoJSON Features
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

  // ULPIN Search
  const handleUlpinQuery = () => {
    const found = parcels.find(p => p.ulpin.toLowerCase() === ulpinInput.trim().toLowerCase());
    if (found) {
      setUlpinResult({
        ulpin: found.ulpin,
        statePortal: 'MahaBhulekh (Govt of Maharashtra)',
        khasra: found.surveyNo,
        owner: found.owner,
        village: found.village,
        area: `${found.areaAcres} Acres`,
        awardValue: `₹${found.costCr} Cr`,
        status: 'Active Section 19 Verification',
        apiLatency: '14ms',
        securityCheck: 'AES-256 Validated (SHA-256 Match)'
      });
      showToast(`✅ ULPIN ${found.ulpin} Verified with State Land Registry!`);
    } else {
      setUlpinResult({
        ulpin: ulpinInput,
        statePortal: 'National Bhu-Aadhaar Gateway',
        khasra: '190/A (Provisional)',
        owner: 'Simulated Verified Landholder',
        village: 'Palghar Central',
        area: '52.0 Acres',
        awardValue: '₹4.50 Cr',
        status: 'Aadhaar Seeded & Valid',
        apiLatency: '19ms',
        securityCheck: 'Digital Signature Verified'
      });
      showToast(`✅ ULPIN ${ulpinInput} queried successfully.`);
    }
  };

  // Find active label
  const activeModuleLabel = useMemo(() => {
    for (const cat of MODULE_CATEGORIES) {
      const found = cat.items.find(i => i.id === activeTab);
      if (found) return found.label;
    }
    return '1. Geoportal GIS Center';
  }, [activeTab]);

  return (
    <div className="geoportal-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 3000, background: 'var(--bg-card)', border: '1px solid var(--accent-cyan)', padding: '0.75rem 1.25rem', borderRadius: '10px', boxShadow: 'var(--card-shadow)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-primary)'}}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 240px CLEAN CATEGORIZED SIDEBAR NAVIGATION (NO ELLIPSES, NO CLIPPING)    */}
      {/* ========================================================================= */}
      <aside className="main-sidebar">
        <div className="sidebar-header">
          <div className="brand-wrapper" onClick={() => setActiveTab('geoportal')}>
            <div className="brand-icon-box">
              <Database size={20} />
            </div>
            <div className="brand-text-block">
              <h1>BHOOMI SETHU</h1>
              <span>AI NATIONAL GEOPORTAL</span>
            </div>
          </div>
        </div>

        <div className="sidebar-nav-scroll">
          {MODULE_CATEGORIES.map(cat => (
            <div key={cat.category}>
              <div className="nav-category-label">{cat.category}</div>
              {cat.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-link-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      showToast(`Opened: ${item.label}`);
                    }}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    <span className="nav-link-badge">{item.badge}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <UserCheck size={16} color="#10b981" />
            <span>Role: <b>{userRole.toUpperCase()}</b></span>
          </div>
          <span style={{fontSize: '0.65rem', color: 'var(--accent-cyan)'}}>TRL-4 (80% Live)</span>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT WITH CLEAN TOP HEADER                                      */}
      {/* ========================================================================= */}
      <div className="app-viewport">
        {/* Top Header Bar */}
        <header className="top-header-bar">
          <div className="header-left-breadcrumbs">
            <span className="breadcrumb-root">National Portal</span>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="breadcrumb-current">
              <Compass size={15} color="var(--accent-cyan)" />
              {activeModuleLabel}
            </span>
          </div>

          <div className="header-right-tools">
            <div className="header-search-bar">
              <Search size={14} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Global ULPIN or parcel search..." 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>

            {/* Theme Switcher Button */}
            <button 
              className="theme-toggle-pill"
              onClick={() => {
                const next = theme === 'white' ? 'dark' : 'white';
                setTheme(next);
                showToast(`Switched Theme: ${next === 'white' ? '☀️ Professional White UI' : '🌙 Cyber Geoportal Dark'}`);
              }}
            >
              {theme === 'white' ? <Moon size={14} /> : <Sun size={14} />}
              <span>{theme === 'white' ? 'Dark Mode' : 'White UI'}</span>
            </button>

            {/* Project Selector */}
            <select 
              className="header-select-pill"
              value={selectedProjectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
            >
              {PROJECTS.map(p => (
                <option key={p.id} value={p.id}>🚆 {p.name}</option>
              ))}
            </select>

            {/* Role Selector */}
            <select 
              className="header-select-pill"
              value={userRole}
              onChange={(e) => {
                setUserRole(e.target.value);
                showToast(`Authority set to: ${e.target.value.toUpperCase()}`);
              }}
            >
              <option value="collector">District Collector</option>
              <option value="state">State Revenue</option>
              <option value="ministry">Central Ministry</option>
              <option value="surveyor">Field Surveyor</option>
            </select>

            {/* Notification Bell */}
            <div style={{position: 'relative', cursor: 'pointer'}} onClick={() => showToast("3 Critical Grievances Scheduled for Hearing")}>
              <Bell size={18} color="var(--text-secondary)" />
              <span style={{position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981'}}></span>
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* MODULE 1: GEOPORTAL GIS CENTER (EXACT REFERENCE SCREENSHOT)              */}
        {/* ========================================================================= */}
        {activeTab === 'geoportal' && (
          <div className="geoportal-main-grid">
            {/* Left Column: Acquisition Summary & AI Delay Risk */}
            <div className="stat-panel-column">
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
                    <div className="kpi-value cyan" style={{fontSize: '1.2rem'}}>12,450 <span style={{fontSize: '0.65rem', color: 'var(--text-muted)'}}>ACRES</span></div>
                  </div>
                </div>
              </div>

              <div className="portal-card" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                <div className="card-header-row" style={{marginBottom: '0.2rem'}}>
                  <span className="card-title">AI Delay Risk Prediction</span>
                  <BrainCircuit size={14} color="var(--accent-cyan)" />
                </div>
                <div style={{fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>
                  A high-tech risk selected area (RFCTLARR Sec 19)
                </div>

                <div className="speedometer-container" style={{height: '105px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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
                    <div style={{fontSize: '1.5rem', fontWeight: '800', color: '#f97316', lineHeight: 1}}>68%</div>
                    <div style={{fontSize: '0.68rem', fontWeight: '700', color: '#ef4444'}}>High Risk</div>
                  </div>
                </div>

                <div style={{marginTop: '0.4rem'}}>
                  <div style={{fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.3rem'}}>
                    Risk Factors
                  </div>
                  <div style={{height: '75px'}}>
                    <Bar 
                      data={{
                        labels: ['Title Issues', 'Environmental', 'Permitting', 'Owner Non-Comp'],
                        datasets: [{ data: [75, 50, 40, 20], backgroundColor: ['#06b6d4', '#10b981', '#a3e635', '#eab308'], borderRadius: 4, barThickness: 16 }]
                      }} 
                      options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 8 }, color: 'var(--text-muted)' } }, y: { display: false, max: 100 } } }}
                    />
                  </div>
                </div>

                <div style={{marginTop: '0.5rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.3rem'}}>
                    <span>Risk Score</span>
                    <span style={{color: 'var(--accent-cyan)', fontSize: '0.62rem'}}>— Risks  -- Point</span>
                  </div>
                  <div style={{height: '70px'}}>
                    <Line 
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Oct', 'Nov', 'Dec'],
                        datasets: [{ label: 'Risk Score', data: [6, 12, 9, 14, 11, 15, 17, 13, 16, 19], borderColor: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.15)', fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2 }]
                      }}
                      options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 7 }, color: 'var(--text-muted)' } }, y: { display: false } } }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column: Hero Map with Glowing Neon Parcels */}
            <div className="center-map-container">
              <div className="glowing-parcels-floating-header">
                <div style={{display: 'flex', alignItems: 'center', gap: '0.65rem'}}>
                  <span style={{fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent-cyan)'}}>Glowing Parcels</span>
                  <div style={{display: 'flex', gap: '0.3rem'}}>
                    <button className={`mini-tab-pill ${glowingTab === 'id' ? 'active' : ''}`} onClick={() => setGlowingTab('id')}>Parcel ID</button>
                    <button className={`mini-tab-pill ${glowingTab === 'status' ? 'active' : ''}`} onClick={() => setGlowingTab('status')}>Status</button>
                    <button className={`mini-tab-pill ${glowingTab === 'owner' ? 'active' : ''}`} onClick={() => setGlowingTab('owner')}>Owner</button>
                    <button className={`mini-tab-pill ${glowingTab === 'size' ? 'active' : ''}`} onClick={() => setGlowingTab('size')}>Size</button>
                  </div>
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '0.35rem'}}>
                  <button className="mini-tab-pill" onClick={() => setShowLayersDropdown(!showLayersDropdown)}>
                    <Layers size={12} /> Basemap: {BASEMAPS[currentBasemap].name.split('(')[0]}
                  </button>
                  <button className="mini-tab-pill active">
                    📍 {currentProject.region}
                  </button>
                </div>
              </div>

              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                minZoom={3}
                maxZoom={19}
                style={{ height: '100%', width: '100%', background: theme === 'white' ? '#e2e8f0' : '#070d18' }}
                zoomControl={false}
              >
                <MapFlyController center={mapCenter} zoom={mapZoom} />

                <TileLayer
                  key={currentBasemap}
                  url={BASEMAPS[currentBasemap].url}
                  attribution={BASEMAPS[currentBasemap].attribution}
                  maxZoom={19}
                />

                <Polyline
                  positions={CORRIDOR_ALIGNMENT}
                  pathOptions={{ color: '#06b6d4', weight: 4, opacity: 0.9, dashArray: '8, 6' }}
                />

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

            {/* Right Column: Acquisition Stage, Gantt Timeline & Task Kanban */}
            <div className="stat-panel-column">
              <div className="portal-card">
                <div className="card-header-row">
                  <span className="card-title">Acquisition Stage</span>
                  <Award size={14} color="var(--accent-cyan)" />
                </div>
                <div style={{height: '120px', position: 'relative'}}>
                  <Doughnut 
                    data={{
                      labels: ['Discovery', 'Negotiation', 'Due Diligence', 'Permitting', 'Closed'],
                      datasets: [{ data: [15, 30, 21, 7, 27], backgroundColor: ['#06b6d4', '#eab308', '#f97316', '#8b5cf6', '#10b981'], borderWidth: 0, hoverOffset: 4 }]
                    }} 
                    options={{ cutout: '68%', maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                  />
                </div>
                <div style={{marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.7rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}><span style={{width: 7, height: 7, borderRadius: '50%', background: '#06b6d4'}}></span> Discovery</span>
                    <span style={{fontWeight: '700'}}>15%</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}><span style={{width: 7, height: 7, borderRadius: '50%', background: '#eab308'}}></span> Negotiation</span>
                    <span style={{fontWeight: '700'}}>30%</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}><span style={{width: 7, height: 7, borderRadius: '50%', background: '#f97316'}}></span> Due Diligence</span>
                    <span style={{fontWeight: '700'}}>21%</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}><span style={{width: 7, height: 7, borderRadius: '50%', background: '#8b5cf6'}}></span> Permitting</span>
                    <span style={{fontWeight: '700'}}>7%</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}><span style={{width: 7, height: 7, borderRadius: '50%', background: '#10b981'}}></span> Closed / Acquired</span>
                    <span style={{fontWeight: '700'}}>27%</span>
                  </div>
                </div>
              </div>

              <div className="portal-card">
                <div className="card-header-row">
                  <span className="card-title">Project Timeline</span>
                  <Clock size={14} color="var(--text-muted)" />
                </div>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '0.2rem'}}>
                  <span>1h</span><span>2h</span><span>6h</span><span>1w</span><span>1m</span>
                </div>
                <div className="gantt-timeline-container">
                  <div className="gantt-row">
                    <span className="gantt-label">Period 1</span>
                    <div className="gantt-track"><div className="gantt-bar" style={{left: '10%', width: '45%', background: '#06b6d4'}}></div></div>
                  </div>
                  <div className="gantt-row">
                    <span className="gantt-label">Period 2</span>
                    <div className="gantt-track"><div className="gantt-bar" style={{left: '35%', width: '55%', background: '#10b981'}}></div></div>
                  </div>
                  <div className="gantt-row">
                    <span className="gantt-label">Period 3</span>
                    <div className="gantt-track"><div className="gantt-bar" style={{left: '50%', width: '40%', background: '#06b6d4'}}></div></div>
                  </div>
                  <div className="gantt-row">
                    <span className="gantt-label">Period 4</span>
                    <div className="gantt-track"><div className="gantt-bar" style={{left: '70%', width: '25%', background: '#eab308'}}></div></div>
                  </div>
                </div>
              </div>

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
                      <div style={{fontWeight: '700'}}>Negotiation Status</div>
                      <div style={{fontSize: '0.65rem', color: 'var(--text-muted)'}}>Parcel #P784 • Hearing ordered</div>
                    </div>
                    <span style={{color: '#eab308', fontWeight: '800'}}>42%</span>
                  </div>
                  <div className="kanban-item-card">
                    <div>
                      <div style={{fontWeight: '700'}}>Owner Non-Comp</div>
                      <div style={{fontSize: '0.65rem', color: 'var(--text-muted)'}}>Parcel #P235 • Circle Rate</div>
                    </div>
                    <span style={{color: '#f97316', fontWeight: '800'}}>18%</span>
                  </div>
                  <div className="kanban-item-card">
                    <div>
                      <div style={{fontWeight: '700'}}>Resolution Overdue</div>
                      <div style={{fontSize: '0.65rem', color: 'var(--text-muted)'}}>Collector File #75</div>
                    </div>
                    <span style={{color: '#ef4444', fontWeight: '800'}}>CRITICAL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 2: LAND PARCELS CADASTRE (DEEP WORKSPACE)                         */}
        {/* ========================================================================= */}
        {activeTab === 'parcels' && (
          <div className="module-viewport">
            <div className="module-header-banner">
              <div className="module-header-text">
                <h2>National Land Parcel Cadastre Registry</h2>
                <p>Centralized Cadastral Land Bank synchronized across State Revenue Portals with DILRMP GIS integration.</p>
              </div>
              <div style={{display: 'flex', gap: '0.75rem'}}>
                <button className="action-btn-primary" onClick={handleExportCSV}>
                  <Download size={15} /> Export Official CSV Ledger
                </button>
              </div>
            </div>

            <div className="portal-card">
              <table className="clean-portal-table">
                <thead>
                  <tr>
                    <th>Parcel ID</th>
                    <th>ULPIN (Bhu-Aadhaar)</th>
                    <th>Survey / Khasra</th>
                    <th>Registered Owner</th>
                    <th>Village & Node</th>
                    <th>Statutory Stage</th>
                    <th>Area (Acres)</th>
                    <th>Total Award</th>
                    <th>AI Delay Risk</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {parcels.map(p => (
                    <tr key={p.id}>
                      <td style={{fontWeight: '800', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)'}}>#{p.id}</td>
                      <td style={{fontFamily: 'var(--font-mono)', fontSize: '0.74rem'}}>{p.ulpin}</td>
                      <td><b>{p.surveyNo}</b></td>
                      <td style={{fontWeight: '600'}}>{p.owner}</td>
                      <td>{p.village}</td>
                      <td>
                        <span style={{padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700', background: `${p.color}22`, color: p.color, border: `1px solid ${p.color}55`}}>
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
                            setActiveTab('geoportal');
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
        {/* MODULE 3: ULPIN BHU-AADHAAR GATEWAY                                      */}
        {/* ========================================================================= */}
        {activeTab === 'ulpin' && (
          <div className="module-viewport">
            <div className="module-header-banner">
              <div className="module-header-text">
                <h2>14-Digit ULPIN (Bhu-Aadhaar) Interoperability Terminal</h2>
                <p>Standardized REST Adapter querying MahaBhulekh, AnyRoR Gujarat, and Bhulekh UP via unified Bhu-Aadhaar schemas.</p>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem'}}>
              <div className="portal-card">
                <div className="card-header-row">
                  <span className="card-title">Live ULPIN Verification Console</span>
                  <Cpu size={16} color="var(--accent-cyan)" />
                </div>
                <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.25rem'}}>
                  <input 
                    type="text" 
                    value={ulpinInput} 
                    onChange={(e) => setUlpinInput(e.target.value)} 
                    placeholder="Enter 14-digit ULPIN e.g. MH-27-P784-9021" 
                    className="sim-input" 
                    style={{fontFamily: 'var(--font-mono)'}} 
                  />
                  <button className="action-btn-primary" onClick={handleUlpinQuery} style={{whiteSpace: 'nowrap'}}>
                    <Search size={15} /> Query
                  </button>
                </div>

                {ulpinResult ? (
                  <div style={{background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1.25rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem'}}>
                      <span style={{fontWeight: '800', color: 'var(--accent-cyan)'}}>{ulpinResult.ulpin}</span>
                      <span className="badge-tag success">VERIFIED CADASTRAL RECORD</span>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem'}}>
                      <div><span style={{color: 'var(--text-muted)'}}>Origin State Portal:</span><br/><b>{ulpinResult.statePortal}</b></div>
                      <div><span style={{color: 'var(--text-muted)'}}>Survey / Khasra No:</span><br/><b>{ulpinResult.khasra}</b></div>
                      <div><span style={{color: 'var(--text-muted)'}}>Registered Owner:</span><br/><b>{ulpinResult.owner}</b></div>
                      <div><span style={{color: 'var(--text-muted)'}}>Cadastral Area:</span><br/><b>{ulpinResult.area}</b></div>
                      <div><span style={{color: 'var(--text-muted)'}}>Award Calculation:</span><br/><b style={{color: '#10b981'}}>{ulpinResult.awardValue}</b></div>
                      <div><span style={{color: 'var(--text-muted)'}}>Security Check:</span><br/><b style={{color: 'var(--accent-cyan)'}}>{ulpinResult.securityCheck}</b></div>
                    </div>
                  </div>
                ) : (
                  <div style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem'}}>
                    Click Query to resolve the 14-digit cadastral coordinates and title deed.
                  </div>
                )}
              </div>

              <div className="portal-card">
                <div className="card-header-row">
                  <span className="card-title">DigiLocker 7/12 Mutation Card</span>
                  <FileCheck size={16} color="#10b981" />
                </div>
                <div style={{background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem', fontSize: '0.78rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                    <b>GOVERNMENT OF MAHARASHTRA</b>
                    <span className="badge-tag success">SEEDED</span>
                  </div>
                  <div style={{fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.75rem'}}>REVENUE AND FOREST DEPARTMENT • FORM VII-XII</div>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
                    <div><b>Khatiyan No:</b> 482/2026</div>
                    <div><b>Owner:</b> Rameshwar Patil & Legal Heirs</div>
                    <div><b>Aadhaar Hash:</b> SHA256:7f8a...3c9b</div>
                    <div><b>Encumbrance Status:</b> NIL (Clean Title)</div>
                    <div><b>Soil Class:</b> Bagayat (Perennially Irrigated)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 4: BHU-NAKSHA VECTOR ENGINE                                       */}
        {/* ========================================================================= */}
        {activeTab === 'bhunaksha' && (
          <div className="module-viewport">
            <div className="module-header-banner">
              <div className="module-header-text">
                <h2>Bhu-Naksha Cadastral Vector Transformation Engine</h2>
                <p>Translates legacy local cadastral shapefiles (.shp) and Everest 1830 datums into standardized WGS84 EPSG:4326 PostGIS geometry.</p>
              </div>
              <button className="action-btn-primary" onClick={() => showToast("Geometry re-projected across 1,482 polygons with zero topological distortion!")}>
                <RefreshCw size={14} /> Validate Spatial Datum
              </button>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem'}}>
              <div className="portal-card">
                <div className="card-header-row">
                  <span className="card-title">Legacy State Format (Local Cadastre)</span>
                  <span className="badge-tag warning">Everest 1830 Datum</span>
                </div>
                <pre style={{background: 'var(--bg-card-subtle)', padding: '1rem', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5}}>
{`{
  "state_code": "MH",
  "district": "Palghar",
  "taluka": "Virar",
  "survey_no": "142/3A",
  "local_datum": "Everest 1830 (Kalianpur)",
  "northing": 2178940.12,
  "easting": 476890.45,
  "cadastral_sheet": "Sheet_No_14_Virar.shp"
}`}
                </pre>
              </div>

              <div className="portal-card">
                <div className="card-header-row">
                  <span className="card-title">Normalized Bhoomi Sethu Vector Tile</span>
                  <span className="badge-tag success">WGS84 EPSG:4326</span>
                </div>
                <pre style={{background: 'var(--bg-card-subtle)', padding: '1rem', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#10b981', lineHeight: 1.5}}>
{`{
  "type": "Feature",
  "properties": {
    "ulpin": "MH-27-P784-9021",
    "stage": "Section 19",
    "solatium_multiplier": 2.0,
    "centroid": [19.6967, 72.7699]
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[72.744, 19.671], [72.794, 19.671], ...]]
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 5: PM GATI SHAKTI MULTI-MODAL MATRIX                              */}
        {/* ========================================================================= */}
        {activeTab === 'gatishakti' && (
          <div className="module-viewport">
            <div className="module-header-banner">
              <div className="module-header-text">
                <h2>PM Gati Shakti National Master Plan Infrastructure Matrix</h2>
                <p>Eliminates inter-ministerial right-of-way (RoW) clashes across 7 multimodal infrastructure connectivity engines.</p>
              </div>
              <button className="action-btn-primary" onClick={() => showToast("Scanning 142 km Right-of-Way alignment... 0 Clashes Detected!")}>
                <Zap size={14} /> Run RoW Clash Detection
              </button>
            </div>

            <div className="portal-card">
              <table className="clean-portal-table">
                <thead>
                  <tr>
                    <th>Connectivity Engine</th>
                    <th>Nodal Ministry / Agency</th>
                    <th>Shared Right-of-Way Alignment</th>
                    <th>Clearance Buffer Distance</th>
                    <th>Harmonization Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { engine: 'High-Speed Rail (Bullet Train)', agency: 'NHSRCL / Railways', alignment: 'Mumbai-Ahmedabad Corridor C4', buffer: 'Safe 25m Setback', status: '100% Cleared' },
                    { engine: 'National Highways & Expressways', agency: 'MoRTH / NHAI', alignment: 'Delhi-Mumbai Expressway Interchange', buffer: 'Parallel 15m RoW', status: 'Joint Sign-off' },
                    { engine: 'Dedicated Freight Corridor', agency: 'DFCCIL', alignment: 'Western DFC Dahanu Spur', buffer: 'Shared Boundary Fence', status: 'Sec 11 Harmonized' },
                    { engine: 'Natural Gas Grid Pipeline', agency: 'GAIL / MoPNG', alignment: 'Dahej-Uran Gas Grid', buffer: '15m Safety Setback', status: 'NOC Issued' },
                    { engine: 'Power Transmission Grid', agency: 'Powergrid (PGCIL)', alignment: '765kV Wardha-Navsari Line', buffer: 'Tower Clearance Compliant', status: 'Completed' }
                  ].map(item => (
                    <tr key={item.engine}>
                      <td style={{fontWeight: '700', color: 'var(--text-primary)'}}>{item.engine}</td>
                      <td>{item.agency}</td>
                      <td>{item.alignment}</td>
                      <td style={{fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)'}}>{item.buffer}</td>
                      <td><span className="badge-tag success">{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 6: AI DELAY RISK PREDICTOR (SCIKIT-LEARN ML CORE)                 */}
        {/* ========================================================================= */}
        {activeTab === 'mldelay' && (
          <div className="module-viewport">
            <div className="module-header-banner">
              <div className="module-header-text">
                <h2>Scikit-Learn Random Forest Delay Risk Engine (87.4% Accuracy)</h2>
                <p>Predicts corridor bottlenecks, statutory slippages, and cost escalations before court caveats escalate.</p>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem'}}>
              {/* Sensitivity Controls */}
              <div className="portal-card">
                <div className="card-header-row">
                  <span className="card-title">Interactive Sensitivity Simulation Bench</span>
                  <Sliders size={16} color="var(--accent-cyan)" />
                </div>

                <div style={{marginBottom: '0.85rem'}}>
                  <label style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '600', marginBottom: '0.35rem'}}>
                    <span>Statutory Stage:</span>
                    <span style={{color: 'var(--accent-cyan)'}}>{simStage}</span>
                  </label>
                  <select className="sim-select" value={simStage} onChange={(e) => setSimStage(e.target.value)}>
                    <option value="Section 4 SIA">Section 4 - Social Impact Assessment (SIA)</option>
                    <option value="Section 11">Section 11 - Preliminary Gazette Notification</option>
                    <option value="Section 19">Section 19 - Declaration of Public Purpose</option>
                    <option value="Award">Section 23/30 - Award Determination & Solatium</option>
                  </select>
                </div>

                <div style={{marginBottom: '0.85rem'}}>
                  <label style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '600', marginBottom: '0.35rem'}}>
                    <span>Active Court Litigations / Injunctions:</span>
                    <span style={{color: simLitigations > 2 ? '#ef4444' : '#10b981'}}>{simLitigations} Suits</span>
                  </label>
                  <input type="range" min="0" max="8" value={simLitigations} onChange={(e) => setSimLitigations(Number(e.target.value))} className="sim-slider" />
                </div>

                <div style={{marginBottom: '0.85rem'}}>
                  <label style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '600', marginBottom: '0.35rem'}}>
                    <span>Compensation Award Variance vs Circle Rate:</span>
                    <span style={{color: simValuationVariance > 15 ? '#eab308' : '#10b981'}}>+{simValuationVariance}%</span>
                  </label>
                  <input type="range" min="-25" max="45" value={simValuationVariance} onChange={(e) => setSimValuationVariance(Number(e.target.value))} className="sim-slider" />
                </div>

                <div style={{marginBottom: '0.85rem'}}>
                  <label style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '600', marginBottom: '0.35rem'}}>
                    <span>Forest Clearance (MoEFCC NOC):</span>
                    <span style={{color: simForestClearance === 'Approved' ? '#10b981' : '#ef4444'}}>{simForestClearance}</span>
                  </label>
                  <select className="sim-select" value={simForestClearance} onChange={(e) => setSimForestClearance(e.target.value)}>
                    <option value="Approved">Stage-II Clearance Approved</option>
                    <option value="Pending">Stage-I Pending (Bio-diversity Assessment)</option>
                    <option value="Contested">Gram Sabha FRA Consent Contested</option>
                  </select>
                </div>

                <div style={{marginBottom: '0.85rem'}}>
                  <label style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '600', marginBottom: '0.35rem'}}>
                    <span>Revenue Mutation Backlog:</span>
                    <span style={{color: 'var(--accent-cyan)'}}>{simMutationDays} Days</span>
                  </label>
                  <input type="range" min="10" max="120" value={simMutationDays} onChange={(e) => setSimMutationDays(Number(e.target.value))} className="sim-slider" />
                </div>

                <div style={{background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: '8px', padding: '0.8rem'}}>
                  <div style={{fontSize: '0.78rem', fontWeight: '800', color: 'var(--accent-cyan)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                    <Zap size={14} /> Prescriptive AI Decision Recommendation
                  </div>
                  <div style={{fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.5}}>
                    {calculatedRisk.score > 70 ? (
                      <span>⚠️ <b>High Risk Bottleneck:</b> Initiate District Collector Conciliation Tribunal under RFCTLARR Section 64 immediately. Release 50% provisional solatium to mitigate stay order risk.</span>
                    ) : (
                      <span>🟢 <b>Optimal Flow:</b> Statutory milestones on track. Advance parcel to Section 23 Award Gazetting and direct PFMS electronic disbursement.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Inference Card & SHAP Feature Contribution */}
              <div className="portal-card" style={{display: 'flex', flexDirection: 'column'}}>
                <div className="card-header-row">
                  <span className="card-title">Real-Time Delay Risk Output</span>
                  <span className={`badge-tag ${calculatedRisk.score > 70 ? 'critical' : 'success'}`}>
                    {calculatedRisk.score > 70 ? 'CRITICAL RISK' : 'ON TRACK'}
                  </span>
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0.75rem 0'}}>
                  <div style={{width: '130px', height: '130px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Doughnut 
                      data={{
                        datasets: [{
                          data: [calculatedRisk.score, 100 - calculatedRisk.score],
                          backgroundColor: [calculatedRisk.score > 70 ? '#ef4444' : '#10b981', theme === 'white' ? '#e2e8f0' : '#1f293d'],
                          borderWidth: 0,
                          circumference: 180,
                          rotation: 270
                        }]
                      }}
                      options={{ cutout: '80%', maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                    />
                    <div style={{position: 'absolute', top: '55%', textAlign: 'center'}}>
                      <div style={{fontSize: '1.75rem', fontWeight: '800', color: calculatedRisk.score > 70 ? '#ef4444' : '#10b981'}}>
                        {calculatedRisk.score}%
                      </div>
                      <div style={{fontSize: '0.62rem', color: 'var(--text-muted)'}}>Probability</div>
                    </div>
                  </div>

                  <div>
                    <div style={{fontSize: '0.72rem', color: 'var(--text-muted)'}}>Predicted Timeline Slippage</div>
                    <div style={{fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)'}}>
                      +{calculatedRisk.slippage} Months
                    </div>
                    <div style={{fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem'}}>Estimated Escalation Cost</div>
                    <div style={{fontSize: '1.1rem', fontWeight: '700', color: '#eab308'}}>
                      ₹{calculatedRisk.escalation} Crores
                    </div>
                  </div>
                </div>

                <div style={{borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: 'auto'}}>
                  <div style={{fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>
                    SHAP Delay Driver Weights
                  </div>
                  {[
                    { feat: 'Title Injunctions (Civil Appeals)', weight: 38, color: '#ef4444' },
                    { feat: 'Compensation Circle Rate Variance', weight: 28, color: '#eab308' },
                    { feat: 'Forest Clearance (FRA Gram Sabha)', weight: 20, color: 'var(--accent-cyan)' },
                    { feat: 'Bhu-Naksha Cadastral Discrepancy', weight: 14, color: '#8b5cf6' }
                  ].map(f => (
                    <div key={f.feat} style={{marginBottom: '0.4rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.15rem'}}>
                        <span>{f.feat}</span>
                        <span style={{fontWeight: '700'}}>{f.weight}%</span>
                      </div>
                      <div style={{height: 5, background: 'var(--bg-card-subtle)', borderRadius: 3, overflow: 'hidden'}}>
                        <div style={{width: `${f.weight}%`, height: '100%', background: f.color}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 7: CIRCLE RATE & VALUATION ANOMALY AUDITOR                        */}
        {/* ========================================================================= */}
        {activeTab === 'valuation' && (
          <div className="module-viewport">
            <div className="module-header-banner">
              <div className="module-header-text">
                <h2>Isolation Forest Valuation & Circle Rate Anomaly Auditor</h2>
                <p>Detects compensation awards exceeding 2.5 standard deviations from median village circle transactions.</p>
              </div>
            </div>

            <div className="portal-card">
              <table className="clean-portal-table">
                <thead>
                  <tr>
                    <th>Parcel</th>
                    <th>Survey No</th>
                    <th>Sub-Registrar Benchmark</th>
                    <th>Award Determined</th>
                    <th>Variance</th>
                    <th>Anomaly Diagnosis</th>
                    <th>Audit Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{fontWeight: '800', color: 'var(--accent-cyan)'}}>#P235</td>
                    <td>88/1 (Kelwe)</td>
                    <td>₹45,000 / sqm</td>
                    <td>₹53,100 / sqm</td>
                    <td style={{color: '#eab308', fontWeight: '700'}}>+18.0% Mismatch</td>
                    <td>Sub-Circle Ready Reckoner Variance Flagged</td>
                    <td>
                      <button className="mini-tab-pill active" onClick={() => showToast("Auditor Dispatched to Kelwe Sub-Registrar!")}>Trigger Audit</button>
                    </td>
                  </tr>
                  <tr>
                    <td style={{fontWeight: '800', color: 'var(--accent-cyan)'}}>#P784</td>
                    <td>142/3A (Palghar)</td>
                    <td>₹62,000 / sqm</td>
                    <td>₹47,120 / sqm</td>
                    <td style={{color: '#ef4444', fontWeight: '700'}}>-24.0% Sub-market</td>
                    <td>Landowner Litigation Triggered (Sec 26 Appeal)</td>
                    <td>
                      <button className="mini-tab-pill active" onClick={() => showToast("Appeal Docket Forwarded to Collector Tribunal!")}>Review Award</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 8: FOREST & MOEFCC CLEARANCES                                     */}
        {/* ========================================================================= */}
        {activeTab === 'environment' && (
          <div className="module-viewport">
            <div className="module-header-banner">
              <div className="module-header-text">
                <h2>MoEFCC Forest & Environmental Clearances (PARIVESH Portal Bridge)</h2>
                <p>Tracks Stage-I (In-Principle) and Stage-II (Diversion Order) forestry clearances and CAMPA afforestation funds.</p>
              </div>
            </div>

            <div className="portal-card">
              <table className="clean-portal-table">
                <thead>
                  <tr>
                    <th>Corridor Node</th>
                    <th>Forest Division</th>
                    <th>Diversion Area</th>
                    <th>CAMPA Deposit</th>
                    <th>Stage-I Status</th>
                    <th>Stage-II Clearance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Dahanu-Palghar</td>
                    <td>North Konkan Forest</td>
                    <td>14.2 Ha</td>
                    <td>₹18.40 Cr Disbursed</td>
                    <td><span className="badge-tag success">Approved</span></td>
                    <td><span className="badge-tag warning">Pending Bio-Study</span></td>
                  </tr>
                  <tr>
                    <td>Navsari-Surat</td>
                    <td>South Gujarat Circle</td>
                    <td>8.5 Ha</td>
                    <td>₹11.20 Cr Disbursed</td>
                    <td><span className="badge-tag success">Approved</span></td>
                    <td><span className="badge-tag success">Gazetted</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 9: LARR 2013 STATUTORY LIFECYCLE FUNNEL                           */}
        {/* ========================================================================= */}
        {activeTab === 'lifecycle' && (
          <div className="module-viewport">
            <div className="module-header-banner">
              <div className="module-header-text">
                <h2>RFCTLARR Act 2013 Statutory Lifecycle Progression Funnel</h2>
                <p>Tracks statutory compliance deadlines (Section 19(7) mandates 12 months between Sec 11 Gazette and Sec 19 Declaration).</p>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem'}}>
              {[
                { stage: 'Section 4 SIA', label: 'Social Impact Assessment', pct: '100%', count: '148 Parcels', color: '#06b6d4', desc: 'Expert Group SIA Approval' },
                { stage: 'Section 11', label: 'Preliminary Notification', pct: '94%', count: '139 Parcels', color: '#10b981', desc: 'Gazette & Objections Window' },
                { stage: 'Section 19', label: 'Declaration of Acquisition', pct: '81%', count: '120 Parcels', color: '#eab308', desc: 'Declaration of Public Purpose' },
                { stage: 'Section 23/38', label: 'Award & Possession', pct: '69%', count: '102 Parcels', color: '#3b82f6', desc: 'PFMS DBT & Land Handover' }
              ].map(s => (
                <div key={s.stage} className="portal-card" style={{borderTop: `4px solid ${s.color}`}}>
                  <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)'}}>{s.stage}</div>
                  <div style={{fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-primary)', margin: '0.3rem 0'}}>{s.label}</div>
                  <div style={{fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.75rem'}}>{s.desc}</div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem'}}>
                    <span style={{fontWeight: '800', color: s.color}}>{s.pct}</span>
                    <span style={{fontSize: '0.72rem', color: 'var(--text-muted)'}}>{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 10: NLP GRIEVANCES & NOTICE GENERATOR                             */}
        {/* ========================================================================= */}
        {activeTab === 'grievances' && (
          <div className="module-viewport">
            <div className="module-header-banner">
              <div className="module-header-text">
                <h2>NLP Auto-Classified Landowner Grievance Queue & Notice Generator</h2>
                <p>Natural Language Processing model parses regional complaints, assigns adversarial sentiment scores, and auto-drafts legal summons.</p>
              </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
              {[
                { id: 'GRV-401', parcel: '#P784', owner: 'Rameshwar Patil', title: 'Disputed Heirship & Title Partition', severity: 'CRITICAL', sentiment: '-0.85', legalSection: 'RFCTLARR Sec 15 Objection', status: 'Collector Hearing Scheduled' },
                { id: 'GRV-388', parcel: '#P235', owner: 'Gram Sabha Kelwe', title: '18% Compensation Valuation Mismatch below Market Rate', severity: 'WARNING', sentiment: '-0.52', legalSection: 'Sec 26 Ready Reckoner Determination', status: 'Ready Reckoner Audit' },
                { id: 'GRV-374', parcel: '#P912', owner: 'Sunita Devi', title: 'Unlinked 7/12 Land Extracts & Mutation Delay', severity: 'REVIEW', sentiment: '-0.25', legalSection: 'Sec 11 Preliminary Survey', status: 'Notice Dispatched' }
              ].map(g => (
                <div key={g.id} className="portal-card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem'}}>
                      <span style={{fontFamily: 'var(--font-mono)', fontWeight: '800', color: 'var(--accent-cyan)', fontSize: '0.8rem'}}>{g.id}</span>
                      <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{g.parcel} ({g.owner})</span>
                      <span className={`badge-tag ${g.severity === 'CRITICAL' ? 'critical' : 'warning'}`}>{g.severity}</span>
                    </div>
                    <div style={{fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)'}}>{g.title}</div>
                    <div style={{fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem'}}>
                      Citation: <b>{g.legalSection}</b> • NLP Sentiment: <b style={{color: '#ef4444'}}>{g.sentiment}</b> • Status: {g.status}
                    </div>
                  </div>

                  <button 
                    className="action-btn-primary" 
                    onClick={() => {
                      setActiveNoticeCase(g);
                      setShowLegalNoticeModal(true);
                    }}
                  >
                    <Printer size={14} /> Auto-Generate Form E Notice
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 11: SOCIAL IMPACT ASSESSMENT (SIA) & R&R CENSUS                    */}
        {/* ========================================================================= */}
        {activeTab === 'sia' && (
          <div className="module-viewport">
            <div className="module-header-banner">
              <div className="module-header-text">
                <h2>Social Impact Assessment (SIA) & Rehabilitation Census</h2>
                <p>Census of 412 Project-Affected Families (PAFs) and Gram Sabha resolutions under Section 4 of RFCTLARR Act 2013.</p>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem'}}>
              <div className="kpi-tile"><div className="kpi-label">Affected Families</div><div className="kpi-value">412</div></div>
              <div className="kpi-tile"><div className="kpi-label">Gram Sabhas Held</div><div className="kpi-value green">18 / 18</div></div>
              <div className="kpi-tile"><div className="kpi-label">Alternative Plots</div><div className="kpi-value cyan">380 Allocated</div></div>
              <div className="kpi-tile"><div className="kpi-label">R&R Solatium</div><div className="kpi-value yellow">₹28.4 Cr</div></div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 12: PFMS DIRECT BENEFIT TRANSFER & ESCROW VAULT                   */}
        {/* ========================================================================= */}
        {activeTab === 'dbt' && (
          <div className="module-viewport">
            <div className="module-header-banner">
              <div className="module-header-text">
                <h2>PFMS Direct Benefit Transfer (DBT) Compensation Vault</h2>
                <p>Public Financial Management System Aadhaar Bridge disbursement into verified bank accounts.</p>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem'}}>
              <div className="kpi-tile"><div className="kpi-label">Sanctioned Escrow</div><div className="kpi-value">₹1,250.0 Cr</div></div>
              <div className="kpi-tile"><div className="kpi-label">Disbursed via Aadhaar (DBT)</div><div className="kpi-value green">₹865.4 Cr</div></div>
              <div className="kpi-tile"><div className="kpi-label">Held in Litigation Escrow</div><div className="kpi-value" style={{color: '#ef4444'}}>₹384.6 Cr</div></div>
            </div>

            <div className="portal-card">
              <table className="clean-portal-table">
                <thead>
                  <tr>
                    <th>Tranche ID</th>
                    <th>Parcel</th>
                    <th>Beneficiary</th>
                    <th>Bank IFSC</th>
                    <th>Award Amount</th>
                    <th>Disbursement Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)'}}>PFMS-2026-9041</td>
                    <td>#P502</td>
                    <td>Bhupendra Patel</td>
                    <td>SBIN0001429</td>
                    <td style={{fontWeight: '700'}}>₹12.40 Cr</td>
                    <td><span className="badge-tag success">Credited via DBT</span></td>
                  </tr>
                  <tr>
                    <td style={{fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)'}}>PFMS-2026-9039</td>
                    <td>#P580</td>
                    <td>Railway Land Bank Hub</td>
                    <td>HDFC0000882</td>
                    <td style={{fontWeight: '700'}}>₹30.00 Cr</td>
                    <td><span className="badge-tag success">Credited via DBT</span></td>
                  </tr>
                  <tr>
                    <td style={{fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)'}}>PFMS-2026-ESCROW</td>
                    <td>#P784</td>
                    <td>Patil Family Escrow</td>
                    <td>RBI-ESCROW-01</td>
                    <td style={{fontWeight: '700'}}>₹4.28 Cr</td>
                    <td><span className="badge-tag critical">Dispute Hold</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 13: SHA-256 CRYPTOGRAPHIC AUDIT VAULT                             */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="module-viewport">
            <div className="module-header-banner">
              <div className="module-header-text">
                <h2>Cryptographic SHA-256 Tamper-Proof Award Ledger</h2>
                <p>Every compensation order, notice issuance, and PFMS disbursement is signed with cryptographic block hashes.</p>
              </div>
              <button className="action-btn-primary" onClick={() => showToast("Merkle Tree Verification Complete: All 48,206 Blocks Cryptographically Intact!")}>
                <ShieldCheck size={15} /> Verify Merkle Proofs
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
              {[
                { block: 48206, txn: 'PFMS DBT Direct Disbursement Approved', signatory: 'District Collector (DM-GJ-102)', amount: '₹12.40 Cr', hash: '0x8f2a1b9c44d7e8201fa877c449190d5' },
                { block: 48205, txn: 'Section 38 Possession Handover Recorded', signatory: 'SLAO Gautam Buddha Nagar', amount: '₹48.00 Cr', hash: '0x6e41b9d033a887f19920ac4109d43ef1' },
                { block: 48204, txn: 'PFMS Direct Disbursement Credited', signatory: 'District Collector (DM-MH-204)', amount: '₹19.60 Cr', hash: '0x7f8a3c9b21a8f94e63b01c72ea8910d5' }
              ].map(b => (
                <div key={b.block} className="portal-card">
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem'}}>
                    <span style={{fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#10b981', fontSize: '0.75rem'}}>BLOCK #{b.block}</span>
                    <span className="badge-tag success">CRYPTOGRAPHICALLY VALID</span>
                  </div>
                  <div style={{fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)'}}>{b.txn}</div>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.3rem'}}>
                    <span>Signatory: <b>{b.signatory}</b></span>
                    <span>Disbursed: <b style={{color: '#10b981'}}>{b.amount}</b></span>
                  </div>
                  <div style={{fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.35rem'}}>
                    Hash: {b.hash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 14: MULTI-TIER RBAC ROLES MATRIX                                  */}
        {/* ========================================================================= */}
        {activeTab === 'rbac' && (
          <div className="module-viewport">
            <div className="module-header-banner">
              <div className="module-header-text">
                <h2>Multi-Tier Role-Based Access Control (RBAC) Governance Matrix</h2>
                <p>Separation-of-powers matrix governing Central Ministry, State Revenue, District Collector, and Field Surveyor tiers.</p>
              </div>
            </div>

            <div className="portal-card">
              <table className="clean-portal-table">
                <thead>
                  <tr>
                    <th>Tier Authority</th>
                    <th>Jurisdiction</th>
                    <th>Spatial Cadastre</th>
                    <th>Notice Issuance</th>
                    <th>PFMS Award Signatory</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><b>Central Ministry</b></td><td>National Corridor</td><td>Full Read/Audit</td><td>Policy Directives</td><td>Budget Escrow Sanction</td></tr>
                  <tr><td><b>State Revenue Dept</b></td><td>Statewide</td><td>Full Oversight</td><td>Sec 11 Gazette Notice</td><td>Audit Oversight</td></tr>
                  <tr><td><b>District Collector / SLAO</b></td><td>District / Node</td><td>Local Polygons</td><td>Sec 15 Adjudication</td><td>PFMS DBT Digital Signatory</td></tr>
                  <tr><td><b>Field Surveyor / Talathi</b></td><td>Taluka / Village</td><td>JMS Geo-Survey</td><td>Field Summons</td><td>No Financial Authority</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 15: MILESTONE GANTT SCHEDULER                                     */}
        {/* ========================================================================= */}
        {activeTab === 'timeline' && (
          <div className="module-viewport">
            <div className="module-header-banner">
              <div className="module-header-text">
                <h2>Statutory Gazette Milestone Scheduler & Critical Path Analysis</h2>
                <p>Critical path dependencies tracking statutory Gazette windows across Section 4, 11, 15, 19, 23, and 38.</p>
              </div>
            </div>

            <div className="portal-card">
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.85rem'}}>
                {[
                  { phase: 'Social Impact Assessment (SIA)', duration: 'M1 - M3', progress: 100, color: '#10b981' },
                  { phase: 'Section 11 Preliminary Gazette Notification', duration: 'M4 - M6', progress: 94, color: '#06b6d4' },
                  { phase: 'Section 15 Landowner Objections & Conciliation', duration: 'M7 - M9', progress: 75, color: '#eab308' },
                  { phase: 'Section 19 Declaration of Public Purpose', duration: 'M10 - M12', progress: 81, color: '#8b5cf6' },
                  { phase: 'Section 23 Award & Direct Benefit Transfer', duration: 'M13 - M16', progress: 69, color: '#3b82f6' },
                  { phase: 'Section 38 Possession Handover to NHSRCL', duration: 'M17 - M20', progress: 45, color: '#f97316' }
                ].map(p => (
                  <div key={p.phase}>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem'}}>
                      <span style={{fontWeight: '700'}}>{p.phase}</span>
                      <span style={{fontFamily: 'var(--font-mono)', color: p.color, fontWeight: '700'}}>{p.duration} ({p.progress}%)</span>
                    </div>
                    <div style={{height: 10, background: 'var(--bg-card-subtle)', borderRadius: 5, overflow: 'hidden'}}>
                      <div style={{width: `${p.progress}%`, height: '100%', background: p.color, borderRadius: 5}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 16: LIVE TELEMETRY AUDIT STREAM                                   */}
        {/* ========================================================================= */}
        {activeTab === 'activity' && (
          <div className="module-viewport">
            <div className="module-header-banner">
              <div className="module-header-text">
                <h2>Live National Telemetry & Event Audit Stream</h2>
                <p>Streaming log of Gazette releases, court caveats, PFMS tranches, and field JMS spatial updates.</p>
              </div>
              <button className="action-btn-primary" onClick={() => showToast("Compiled SIH Executive Briefing Dossier (PDF)!")}>
                <Download size={14} /> Download Briefing PDF
              </button>
            </div>

            <div className="portal-card">
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.65rem'}}>
                {[
                  { time: '10 mins ago', event: 'PFMS DBT Tranche of ₹12.40 Cr credited to Bhupendra Patel (Surat C4)', tag: 'Finance' },
                  { time: '28 mins ago', event: 'Section 15 Legal Notice Form E served to Rameshwar Patil (Palghar)', tag: 'Legal' },
                  { time: '1 hour ago', event: 'MoEFCC Stage-II Forest Diversion approved for Dahanu Node (14.2 Ha)', tag: 'Clearance' },
                  { time: '2 hours ago', event: 'Isolation Forest flagged 18% Circle Rate variance on Parcel #P235', tag: 'AI Audit' },
                  { time: '3 hours ago', event: 'Joint Measurement Survey (JMS) vector shapefile uploaded by Talathi', tag: 'Field Survey' }
                ].map(item => (
                  <div key={item.event} style={{background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.65rem 0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                      <span className="badge-tag info">{item.tag}</span>
                      <span style={{fontSize: '0.8rem', fontWeight: '600'}}>{item.event}</span>
                    </div>
                    <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>{item.time}</span>
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
          <div style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '520px', boxShadow: 'var(--card-shadow)'}} onClick={(e) => e.stopPropagation()}>
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
              className="action-btn-primary"
              style={{width: '100%', justifyContent: 'center'}}
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

      {/* Official Legal Summons Notice Form Modal (Module 10) */}
      {showLegalNoticeModal && activeNoticeCase && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2600}} onClick={() => setShowLegalNoticeModal(false)}>
          <div style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '640px', boxShadow: 'var(--card-shadow)'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem'}}>
              <div>
                <span style={{fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)'}}>STATUTORY SUMMONS NOTICE (FORM E - SECTION 15)</span>
                <div style={{fontSize: '0.72rem', color: 'var(--text-muted)'}}>COURT OF THE DISTRICT MAGISTRATE & LAND ACQUISITION OFFICER</div>
              </div>
              <button onClick={() => setShowLegalNoticeModal(false)} style={{background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'}}><X size={18} /></button>
            </div>

            <div style={{background: 'var(--bg-card-subtle)', padding: '1.25rem', borderRadius: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)'}}>
              <b>NOTICE UNDER SECTION 15(2) OF THE RFCTLARR ACT, 2013</b><br/>
              <b>CASE FILE NO:</b> {activeNoticeCase.id}/2026/SLAO<br/>
              <b>IN RE:</b> Parcel {activeNoticeCase.parcel} (Landowner: {activeNoticeCase.owner})<br/><br/>
              WHEREAS an objection regarding "<b>{activeNoticeCase.title}</b>" has been registered on the Bhoomi Sethu National Portal.<br/>
              YOU ARE HEREBY SUMMONED to appear before the Collector's Tribunal on <b>16-OCT-2026 at 11:00 AM</b> with original 7/12 extracts, Registered Sale Deeds, and Succession Certificates.<br/><br/>
              GIVEN UNDER MY HAND AND THE SEAL OF THIS COURT.<br/>
              <i>District Magistrate & Special Land Acquisition Officer (Palghar)</i>
            </div>

            <div style={{display: 'flex', gap: '0.75rem'}}>
              <button 
                className="action-btn-primary" 
                style={{flex: 1, justifyContent: 'center'}}
                onClick={() => {
                  showToast(`📜 Notice Form E officially served to ${activeNoticeCase.owner} via SMS & Registered Speed Post!`);
                  setShowLegalNoticeModal(false);
                }}
              >
                <Printer size={15} /> Confirm & Dispatch Statutory Notice
              </button>
              <button className="header-select-pill" onClick={() => setShowLegalNoticeModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
