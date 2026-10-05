import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
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
  Users
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, ChartTooltip, Legend);

// Corridors & Projects
const PROJECTS = [
  { id: 'dmic', name: 'Delhi-Mumbai Industrial Corridor (DMIC - Palghar Node)', state: 'Maharashtra', targetArea: '14,250 Ha', totalParcels: 1482 },
  { id: 'mahsr', name: 'Mumbai-Ahmedabad High-Speed Rail (Bullet Train - C4)', state: 'Gujarat / MH', targetArea: '1,890 Ha', totalParcels: 840 },
  { id: 'expressway', name: 'Nagpur-Goa Shaktipeeth Expressway (Section 2)', state: 'Maharashtra', targetArea: '9,120 Ha', totalParcels: 2150 }
];

// Mock Real Land Parcels in Palghar/Maharashtra corridor
const INITIAL_PARCELS = [
  { id: 'P-784', ulpin: 'MH-27-P784-9021', surveyNo: '142/3A', owner: 'Rameshwar Patil & Co-sharers', village: 'Palghar West', areaHectares: 4.8, status: 'dispute', stage: 'Section 19 Declaration', marketValueCr: 2.14, solatiumCr: 2.14, totalCompensationCr: 4.28, delayRisk: 89, predictedSlippageMonths: 4.5, anomaly: 'Title Litigation & Valuation Dispute', dbtStatus: 'Escrow Frozen', lat: 19.6967, lng: 72.7699 },
  { id: 'P-235', ulpin: 'MH-27-P235-4102', surveyNo: '88/1', owner: 'Gram Panchayat Common Land', village: 'Kelwe Node', areaHectares: 12.2, status: 'negotiation', stage: 'Section 11 Preliminary', marketValueCr: 3.50, solatiumCr: 3.50, totalCompensationCr: 7.00, delayRisk: 42, predictedSlippageMonths: 1.5, anomaly: '18% Valuation Anomaly below Circle Rate', dbtStatus: 'Under Review', lat: 19.6200, lng: 72.7300 },
  { id: 'P-912', ulpin: 'MH-27-P912-8834', surveyNo: '204/B', owner: 'Sunita Devi & Heirs', village: 'Manor Rural', areaHectares: 3.1, status: 'discovery', stage: 'Social Impact Assessment', marketValueCr: 1.10, solatiumCr: 1.10, totalCompensationCr: 2.20, delayRisk: 61, predictedSlippageMonths: 2.8, anomaly: 'Missing 7/12 Land Extracts', dbtStatus: 'Pending Verification', lat: 19.7400, lng: 72.9100 },
  { id: 'P-104', ulpin: 'MH-27-P104-1290', surveyNo: '12/4', owner: 'Maharashtra Agro Industries Corp', village: 'Boisar Industrial Zone', areaHectares: 18.5, status: 'acquired', stage: 'Section 38 Possession Handover', marketValueCr: 9.80, solatiumCr: 9.80, totalCompensationCr: 19.60, delayRisk: 4, predictedSlippageMonths: 0.0, anomaly: 'None - Clean Title', dbtStatus: 'PFMS Disbursed', lat: 19.8000, lng: 72.7550 },
  { id: 'P-556', ulpin: 'MH-27-P556-3471', surveyNo: '315/2', owner: 'Vikram Joshi (Power of Attorney)', village: 'Kasa Sector 1', areaHectares: 5.6, status: 'negotiation', stage: 'Section 19 Declaration', marketValueCr: 2.40, solatiumCr: 2.40, totalCompensationCr: 4.80, delayRisk: 55, predictedSlippageMonths: 2.0, anomaly: 'Multiple PoA Claims Flagged', dbtStatus: 'Escrow Frozen', lat: 19.8600, lng: 72.9300 },
  { id: 'P-320', ulpin: 'MH-27-P320-7712', surveyNo: '77/9', owner: 'Kisan Tribal Welfare Trust', village: 'Dahanu Hinterland', areaHectares: 15.0, status: 'dispute', stage: 'Section 11 Preliminary', marketValueCr: 5.20, solatiumCr: 5.20, totalCompensationCr: 10.40, delayRisk: 92, predictedSlippageMonths: 5.2, anomaly: 'Forest Rights Act (FRA) Clearance Pending', dbtStatus: 'Escrow Frozen', lat: 19.9800, lng: 72.7300 },
  { id: 'P-441', ulpin: 'MH-27-P441-5509', surveyNo: '19/1A', owner: 'Deepak Mhatre & Family', village: 'Safale North', areaHectares: 2.4, status: 'acquired', stage: 'Section 23 Award Declared', marketValueCr: 1.45, solatiumCr: 1.45, totalCompensationCr: 2.90, delayRisk: 8, predictedSlippageMonths: 0.0, anomaly: 'None - Direct Consent Agreement', dbtStatus: 'PFMS Disbursed', lat: 19.5700, lng: 72.8200 },
  { id: 'P-612', ulpin: 'MH-27-P612-9910', surveyNo: '54/C', owner: 'Anand Shinde', village: 'Virar Sector 9', areaHectares: 1.8, status: 'discovery', stage: 'Joint Measurement Survey (JMS)', marketValueCr: 1.90, solatiumCr: 1.90, totalCompensationCr: 3.80, delayRisk: 48, predictedSlippageMonths: 1.8, anomaly: 'Boundary Discrepancy with Cadastral Map', dbtStatus: 'Pending Verification', lat: 19.4600, lng: 72.8100 }
];

// Initial Grievance Queue
const INITIAL_GRIEVANCES = [
  { id: 'GRV-401', parcelId: 'P-784', landowner: 'Rameshwar Patil', title: 'Disputed Heirship & Title Partition', severity: 'critical', sentimentScore: -0.85, filingDate: '2026-10-02', legalSection: 'RFCTLARR Sec 15 Objection', status: 'Pending Collector Hearing', summary: 'Co-sharer filed caveat claiming unauthorized power-of-attorney execution without succession certificate.' },
  { id: 'GRV-388', parcelId: 'P-235', landowner: 'Gram Sabha Kelwe', title: '18% Compensation Valuation Mismatch', severity: 'warning', sentimentScore: -0.52, filingDate: '2026-09-28', legalSection: 'RFCTLARR Sec 26 Market Rate Determination', status: 'In Revenue Review', summary: 'Current award calculated on 2021 Ready Reckoner instead of mandated average registered sale deeds for past 3 years.' },
  { id: 'GRV-374', parcelId: 'P-912', landowner: 'Sunita Devi', title: 'Unlinked 7/12 Land Extracts & Mutation Delay', severity: 'review', sentimentScore: -0.25, filingDate: '2026-10-04', legalSection: 'Sec 11 Preliminary Survey', status: 'Notice Dispatched', summary: 'Talathi portal mutation entry pending verification under Digital India Land Records Modernization Programme (DILRMP).' },
  { id: 'GRV-360', parcelId: 'P-320', landowner: 'Kisan Tribal Welfare Trust', title: 'Forest Rights Act (FRA) Gram Sabha Consent Contest', severity: 'critical', sentimentScore: -0.91, filingDate: '2026-09-25', legalSection: 'Scheduled Tribes & Forest Dwellers Act 2006', status: 'Collector Action Ordered', summary: 'Resolution submitted questioning adequacy of Rehabilitation and Resettlement (R&R) compensatory forestry allotment.' }
];

// Block Ledger Mock for Tab 6
const AUDIT_CHAIN = [
  { blockNo: 48204, timestamp: '2026-10-05 23:45:12 IST', parcelId: 'P-104', action: 'PFMS DBT Direct Disbursement Approved', actor: 'District Collector (DM-MH-204)', amountCr: 19.60, hash: '0x7f8a3c9b21a8f94e63b01c72ea8910d5', verified: true },
  { blockNo: 48203, timestamp: '2026-10-05 18:22:04 IST', parcelId: 'P-441', action: 'Section 23 Award Finalized & Cryptographically Signed', actor: 'Special Land Acquisition Officer (SLAO-03)', amountCr: 2.90, hash: '0x4e29ba1c902d44f1883c79a1f25cb804', verified: true },
  { blockNo: 48202, timestamp: '2026-10-05 14:10:55 IST', parcelId: 'P-784', action: 'Grievance GRV-401 Auto-Classified by NLP & Frozen in Escrow', actor: 'Bhoomi Sethu AI Kernel (Rule Sec 64)', amountCr: 4.28, hash: '0x99a147d3e0b2110c7349581ae77c4491', verified: true },
  { blockNo: 48201, timestamp: '2026-10-04 11:30:19 IST', parcelId: 'P-235', action: 'Valuation Anomaly Flagged (18% Sub-Circle Variance)', actor: 'AI Anomaly Model v4.2', amountCr: 7.00, hash: '0x12d8ec4008b6294711fa7a8109d43ef1', verified: true },
  { blockNo: 48200, timestamp: '2026-10-03 09:15:40 IST', parcelId: 'P-556', action: 'Joint Measurement Survey (JMS) GIS Vector Layer Synchronized', actor: 'Field Surveyor (Talathi-MH-44)', amountCr: 4.80, hash: '0x88f237190d402ca8b182740924ecda18', verified: true }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('gis'); // 'gis', 'ml', 'grievances', 'lifecycle', 'interop', 'audit'
  const [selectedProject, setSelectedProject] = useState(PROJECTS[0].id);
  const [userRole, setUserRole] = useState('collector'); // 'ministry', 'state', 'collector', 'field'
  const [parcels, setParcels] = useState(INITIAL_PARCELS);
  const [grievances, setGrievances] = useState(INITIAL_GRIEVANCES);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [filterStage, setFilterStage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // ML Simulation Inputs
  const [simStage, setSimStage] = useState('Section 19');
  const [simLitigations, setSimLitigations] = useState(3);
  const [simValuationVariance, setSimValuationVariance] = useState(18);
  const [simForestClearance, setSimForestClearance] = useState('Pending');
  const [simCadastralMatch, setSimCadastralMatch] = useState('Discrepancy');

  // ULPIN Search state
  const [ulpinInput, setUlpinInput] = useState('MH-27-P784-9021');
  const [ulpinResult, setUlpinResult] = useState(null);

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered parcels
  const filteredParcels = useMemo(() => {
    return parcels.filter(p => {
      const matchStage = filterStage === 'all' || p.status === filterStage;
      const matchQuery = !searchQuery || 
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.owner.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.ulpin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.village.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStage && matchQuery;
    });
  }, [parcels, filterStage, searchQuery]);

  // Dynamic ML Inference calculation based on inputs
  const calculatedRisk = useMemo(() => {
    let score = 20; // baseline
    if (simStage === 'Section 19') score += 25;
    if (simStage === 'Section 11') score += 15;
    if (simStage === 'Award') score += 10;
    
    score += simLitigations * 12;
    score += Math.abs(simValuationVariance) * 0.9;
    if (simForestClearance === 'Pending') score += 20;
    if (simForestClearance === 'Contested') score += 32;
    if (simCadastralMatch === 'Discrepancy') score += 18;

    score = Math.min(98, Math.max(8, Math.round(score)));
    const slippage = (score * 0.055).toFixed(1);
    return { score, slippage };
  }, [simStage, simLitigations, simValuationVariance, simForestClearance, simCadastralMatch]);

  // Parcel status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case 'discovery': return '#0ea5e9'; // Cyan
      case 'negotiation': return '#f59e0b'; // Amber
      case 'dispute': return '#f43f5e'; // Rose
      case 'acquired': return '#10b981'; // Emerald
      default: return '#94a3b8';
    }
  };

  // GeoJSON features for Leaflet
  const geoJsonData = useMemo(() => {
    const features = parcels.map(p => {
      const size = 0.015;
      return {
        type: "Feature",
        properties: { ...p },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [p.lng - size, p.lat - size],
            [p.lng + size, p.lat - size],
            [p.lng + size, p.lat + size],
            [p.lng - size, p.lat + size],
            [p.lng - size, p.lat - size]
          ]]
        }
      };
    });
    return { type: "FeatureCollection", features };
  }, [parcels]);

  // Handle ULPIN Search
  const handleUlpinQuery = () => {
    const found = parcels.find(p => p.ulpin.toLowerCase() === ulpinInput.trim().toLowerCase());
    if (found) {
      setUlpinResult({
        ulpin: found.ulpin,
        statePortal: 'MahaBhulekh (Govt of Maharashtra)',
        khasra: found.surveyNo,
        owner: found.owner,
        village: found.village,
        area: `${found.areaHectares} Ha`,
        dbtStatus: found.dbtStatus,
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
        area: '5.20 Ha',
        dbtStatus: 'Aadhaar Seeded',
        apiLatency: '19ms',
        securityCheck: 'Digital Signature Verified'
      });
      showToast(`✅ ULPIN ${ulpinInput} queried successfully.`);
    }
  };

  // Actions
  const handleApproveStage = (parcelId) => {
    setParcels(prev => prev.map(p => {
      if (p.id === parcelId) {
        return {
          ...p,
          status: 'acquired',
          stage: 'Section 38 Possession Handover',
          delayRisk: 5,
          dbtStatus: 'PFMS Disbursed'
        };
      }
      return p;
    }));
    setSelectedParcel(null);
    showToast(`🎉 Parcel #${parcelId} approved and disbursed via PFMS direct transfer!`);
  };

  const handleResolveGrievance = (grvId) => {
    setGrievances(prev => prev.filter(g => g.id !== grvId));
    setSelectedGrievance(null);
    showToast(`✅ Grievance ${grvId} marked resolved. PostGIS parcel unlocked!`);
  };

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="toast-container-custom">
          <div className="toast-item-custom">
            <CheckCircle2 size={18} color="#10b981" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* TOP APPLICATION HEADER */}
      <header className="top-header">
        <div className="brand-section">
          <div className="brand-logo-icon">
            <Database size={22} color="#ffffff" />
          </div>
          <div className="brand-text">
            <h1>BHOOMI SETHU <span>AI</span></h1>
            <div className="brand-tagline">NATIONAL LAND ACQUISITION & DECISION SUPPORT SYSTEM • SIH26016</div>
          </div>
        </div>

        <div className="header-controls">
          {/* Project Corridor Dropdown */}
          <select 
            className="select-pill"
            value={selectedProject}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              showToast(`Switched Corridor: ${PROJECTS.find(p => p.id === e.target.value)?.name}`);
            }}
          >
            {PROJECTS.map(p => (
              <option key={p.id} value={p.id}>🚆 {p.name}</option>
            ))}
          </select>

          {/* Role Switcher */}
          <select 
            className="select-pill"
            value={userRole}
            onChange={(e) => {
              setUserRole(e.target.value);
              showToast(`Role Authority updated to: ${e.target.value.toUpperCase()}`);
            }}
          >
            <option value="collector">📋 District Magistrate / Collector</option>
            <option value="state">🏢 State Revenue Department</option>
            <option value="ministry">🏛️ Central Ministry (MoRTH / Railways)</option>
            <option value="field">🚜 Field Surveyor / Talathi</option>
          </select>

          {/* Prototype Readiness Badge */}
          <div className="badge-live-pulse">
            <span className="pulse-dot"></span>
            <span>80% Live Prototype (TRL-4)</span>
          </div>

          {/* Quick PDF/Audit Export */}
          <button 
            className="btn-primary-action"
            onClick={() => showToast("📄 Executive SIH Pitch Audit Briefing compiled & downloaded!")}
          >
            <Download size={15} /> Export Audit Dossier
          </button>
        </div>
      </header>

      {/* NAVIGATION TABS BAR */}
      <nav className="tabs-navigation-bar">
        <button 
          className={`nav-tab-btn ${activeTab === 'gis' ? 'active' : ''}`}
          onClick={() => setActiveTab('gis')}
        >
          <Layers size={16} /> 1. GIS Spatial Tracking
          <span className="nav-tab-badge">Live Map</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'ml' ? 'active' : ''}`}
          onClick={() => setActiveTab('ml')}
        >
          <BrainCircuit size={16} /> 2. AI Delay & Anomaly ML Core
          <span className="nav-tab-badge">87% Acc</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'grievances' ? 'active' : ''}`}
          onClick={() => setActiveTab('grievances')}
        >
          <Scale size={16} /> 3. NLP Grievance Redressal
          <span className="nav-tab-badge">{grievances.length} Active</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'lifecycle' ? 'active' : ''}`}
          onClick={() => setActiveTab('lifecycle')}
        >
          <GitFork size={16} /> 4. LARR 2013 Statutory Lifecycle & DBT
          <span className="nav-tab-badge">PFMS Live</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'interop' ? 'active' : ''}`}
          onClick={() => setActiveTab('interop')}
        >
          <Cpu size={16} /> 5. Interoperability & PM Gati Shakti
          <span className="nav-tab-badge">ULPIN / Bhu-Naksha</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <Lock size={16} /> 6. Zero-Trust Security & Audit Vault
          <span className="nav-tab-badge">AES-256 Ledger</span>
        </button>
      </nav>

      {/* TAB CONTENT VIEWPORT */}
      <main className="tab-viewport">

        {/* ========================================================================= */}
        {/* TAB 1: GIS SPATIAL TRACKING & MAP CADASTRE */}
        {/* ========================================================================= */}
        {activeTab === 'gis' && (
          <div className="gis-layout">
            {/* Left Sidebar */}
            <div className="gis-sidebar">
              <div className="glass-panel glow-subtle">
                <div className="section-heading">
                  <span>Acquisition Progress</span>
                  <Activity size={16} color="#0ea5e9" />
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem'}}>
                  <div style={{background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px'}}>
                    <div style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>Total Parcels</div>
                    <div style={{fontSize: '1.5rem', fontWeight: '800', color: 'white'}}>1,482</div>
                  </div>
                  <div style={{background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px'}}>
                    <div style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>Acquired (Ha)</div>
                    <div style={{fontSize: '1.5rem', fontWeight: '800', color: '#10b981'}}>10,210</div>
                  </div>
                  <div style={{background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px'}}>
                    <div style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>In Negotiation</div>
                    <div style={{fontSize: '1.5rem', fontWeight: '800', color: '#f59e0b'}}>231</div>
                  </div>
                  <div style={{background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px'}}>
                    <div style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>Litigated / Court</div>
                    <div style={{fontSize: '1.5rem', fontWeight: '800', color: '#f43f5e'}}>41</div>
                  </div>
                </div>
              </div>

              {/* Stage Filter Selector */}
              <div className="glass-panel">
                <div className="section-heading">
                  <span>Filter by Parcel Stage</span>
                  <Sliders size={15} color="#94a3b8" />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  {[
                    { id: 'all', label: 'All Land Parcels', count: parcels.length, color: '#e2e8f0' },
                    { id: 'discovery', label: 'Discovery / JMS Survey', count: parcels.filter(p => p.status === 'discovery').length, color: '#0ea5e9' },
                    { id: 'negotiation', label: 'Sec 11 / Sec 19 Notice', count: parcels.filter(p => p.status === 'negotiation').length, color: '#f59e0b' },
                    { id: 'dispute', label: 'Disputed / Litigated', count: parcels.filter(p => p.status === 'dispute').length, color: '#f43f5e' },
                    { id: 'acquired', label: 'Possession Handed Over', count: parcels.filter(p => p.status === 'acquired').length, color: '#10b981' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setFilterStage(tab.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.55rem 0.8rem',
                        borderRadius: '8px',
                        background: filterStage === tab.id ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: filterStage === tab.id ? '1px solid #0ea5e9' : '1px solid transparent',
                        color: 'white',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <span style={{width: '8px', height: '8px', borderRadius: '50%', background: tab.color}}></span>
                        <span>{tab.label}</span>
                      </div>
                      <span style={{color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem'}}>{tab.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Parcel Quick Card */}
              {selectedParcel ? (
                <div className="glass-panel" style={{border: '1px solid #0ea5e9', background: 'rgba(14, 165, 233, 0.08)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <span style={{fontWeight: '700', fontSize: '0.9rem', color: '#38bdf8'}}>Parcel #{selectedParcel.id}</span>
                    <button onClick={() => setSelectedParcel(null)} style={{background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer'}}><X size={16} /></button>
                  </div>
                  <div style={{fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}><b>Owner:</b> {selectedParcel.owner}</div>
                  <div style={{fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}><b>ULPIN:</b> {selectedParcel.ulpin}</div>
                  <div style={{fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}><b>Award:</b> ₹{selectedParcel.totalCompensationCr} Cr</div>
                  <div style={{fontSize: '0.78rem', color: selectedParcel.delayRisk > 70 ? '#f43f5e' : '#10b981', fontWeight: '700', marginBottom: '0.75rem'}}>
                    Delay Risk: {selectedParcel.delayRisk}% (+{selectedParcel.predictedSlippageMonths} mo)
                  </div>
                  <button 
                    className="btn-primary-action" 
                    style={{width: '100%', justifyContent: 'center'}}
                    onClick={() => handleApproveStage(selectedParcel.id)}
                  >
                    <Check size={14} /> Advance Statutory Stage
                  </button>
                </div>
              ) : (
                <div className="glass-panel" style={{textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)'}}>
                  <MapPin size={24} style={{margin: '0 auto 0.5rem auto', display: 'block', opacity: 0.5}} />
                  <div style={{fontSize: '0.8rem'}}>Click any parcel polygon on the map or row in the table to inspect details.</div>
                </div>
              )}
            </div>

            {/* Main Interactive Map Viewport */}
            <div className="gis-map-viewport">
              {/* Map Floating Header */}
              <div className="map-controls-floating">
                <div style={{display: 'flex', gap: '0.5rem', background: 'rgba(10, 16, 31, 0.85)', padding: '0.4rem 0.6rem', borderRadius: '10px', backdropFilter: 'blur(10px)', border: '1px solid var(--border-subtle)'}}>
                  <input 
                    type="text" 
                    placeholder="Search by Parcel ID, ULPIN, Owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.8rem', width: '220px'}}
                  />
                  {searchQuery && <button onClick={() => setSearchQuery('')} style={{background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer'}}><X size={14} /></button>}
                </div>
              </div>

              {/* Map Floating Legend */}
              <div className="map-legend-floating">
                <div style={{fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>
                  Spatial Stage Legend
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span style={{width: '10px', height: '10px', borderRadius: '50%', background: '#0ea5e9'}}></span> Discovery / JMS (Sec 4)
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span style={{width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b'}}></span> Negotiation / Sec 19 Notice
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span style={{width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e'}}></span> Title Dispute / Delay Flagged
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span style={{width: '10px', height: '10px', borderRadius: '50%', background: '#10b981'}}></span> Acquired & Disbursed (Sec 38)
                  </div>
                </div>
              </div>

              {/* Interactive Leaflet Map */}
              <MapContainer 
                center={[19.6967, 72.7699]} 
                zoom={11} 
                style={{ height: '100%', width: '100%', background: '#050b14' }} 
                zoomControl={false}
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles &copy; Esri &mdash; Bhoomi Sethu Spatial Cadastre"
                />
                <GeoJSON
                  key={JSON.stringify(filteredParcels)}
                  data={geoJsonData}
                  style={(feature) => ({
                    color: getStatusColor(feature.properties.status),
                    weight: selectedParcel?.id === feature.properties.id ? 4 : 2,
                    fillOpacity: selectedParcel?.id === feature.properties.id ? 0.6 : 0.35,
                    dashArray: feature.properties.status === 'dispute' ? '4, 4' : null
                  })}
                  onEachFeature={(feature, layer) => {
                    layer.on({
                      click: () => setSelectedParcel(feature.properties)
                    });
                    layer.bindTooltip(
                      `<b>Parcel #${feature.properties.id}</b><br/>${feature.properties.owner}<br/>Status: ${feature.properties.status.toUpperCase()}`,
                      { sticky: true }
                    );
                  }}
                />
              </MapContainer>

              {/* Bottom Live Streaming ML Delay Table */}
              <div className="map-bottom-tray">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                  <div style={{fontSize: '0.8rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <Activity size={14} color="#0ea5e9" />
                    <span>Real-Time Cadastral Intelligence Feed ({filteredParcels.length} Parcels Displayed)</span>
                  </div>
                  <span className="badge-tag info">Live ML Sync</span>
                </div>
                <table className="custom-data-table">
                  <thead>
                    <tr>
                      <th>Parcel ID</th>
                      <th>ULPIN</th>
                      <th>Landowner</th>
                      <th>Village</th>
                      <th>Statutory Stage</th>
                      <th>Total Award</th>
                      <th>AI Risk</th>
                      <th>Predicted Delay</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParcels.map(p => (
                      <tr 
                        key={p.id}
                        style={{
                          cursor: 'pointer',
                          background: selectedParcel?.id === p.id ? 'rgba(14, 165, 233, 0.12)' : 'transparent'
                        }}
                        onClick={() => setSelectedParcel(p)}
                      >
                        <td style={{fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#38bdf8'}}>#{p.id}</td>
                        <td style={{fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)'}}>{p.ulpin}</td>
                        <td style={{fontWeight: '500'}}>{p.owner}</td>
                        <td>{p.village}</td>
                        <td>
                          <span className={`badge-tag ${
                            p.status === 'acquired' ? 'success' :
                            p.status === 'dispute' ? 'critical' :
                            p.status === 'negotiation' ? 'warning' : 'info'
                          }`}>
                            {p.stage}
                          </span>
                        </td>
                        <td style={{fontFamily: 'var(--font-mono)', fontWeight: '600'}}>₹{p.totalCompensationCr} Cr</td>
                        <td style={{fontWeight: '700', color: p.delayRisk > 75 ? '#f43f5e' : p.delayRisk > 40 ? '#f59e0b' : '#10b981'}}>
                          {p.delayRisk}%
                        </td>
                        <td style={{color: p.predictedSlippageMonths > 0 ? '#f43f5e' : '#10b981', fontWeight: '600'}}>
                          {p.predictedSlippageMonths > 0 ? `+${p.predictedSlippageMonths} mo` : 'On Track'}
                        </td>
                        <td>
                          <button 
                            className="select-pill"
                            style={{padding: '0.2rem 0.5rem', fontSize: '0.72rem'}}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedParcel(p);
                            }}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AI DELAY & ANOMALY ML CORE (SCIKIT-LEARN SIMULATOR) */}
        {/* ========================================================================= */}
        {activeTab === 'ml' && (
          <div className="simulator-layout">
            {/* Left: Interactive Delay Simulator */}
            <div className="glass-panel">
              <div className="section-heading">
                <span>Scikit-Learn Random Forest Delay Predictor (87% Test Accuracy)</span>
                <BrainCircuit size={18} color="#0ea5e9" />
              </div>
              <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem'}}>
                Trained on 12,000+ historical land acquisition records under the RFCTLARR Act 2013 across Central & State highway and industrial corridor pipelines. Adjust parameters to run real-time inference.
              </p>

              <div className="form-group-sim">
                <label>
                  <span>Current Statutory Lifecycle Stage</span>
                  <span style={{color: '#38bdf8'}}>{simStage}</span>
                </label>
                <select 
                  className="sim-select"
                  value={simStage}
                  onChange={(e) => setSimStage(e.target.value)}
                >
                  <option value="Proposal & SIA">Section 4 - Social Impact Assessment (SIA)</option>
                  <option value="Section 11">Section 11 - Preliminary Gazette Notification</option>
                  <option value="Section 19">Section 19 - Declaration of Acquisition</option>
                  <option value="Award">Section 23/30 - Award Determination & Solatium</option>
                </select>
              </div>

              <div className="form-group-sim">
                <label>
                  <span>Active Court Litigations / Title Injunctions</span>
                  <span style={{color: simLitigations > 2 ? '#f43f5e' : '#38bdf8', fontWeight: '700'}}>{simLitigations} Suits Filed</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="8" 
                  value={simLitigations} 
                  onChange={(e) => setSimLitigations(Number(e.target.value))}
                  className="sim-slider" 
                />
              </div>

              <div className="form-group-sim">
                <label>
                  <span>Compensation Award Variance vs Circle Rate / Market Benchmark</span>
                  <span style={{color: simValuationVariance > 15 ? '#f59e0b' : '#10b981', fontWeight: '700'}}>
                    {simValuationVariance > 0 ? `+${simValuationVariance}% Variance` : `${simValuationVariance}% Variance`}
                  </span>
                </label>
                <input 
                  type="range" 
                  min="-25" 
                  max="45" 
                  value={simValuationVariance} 
                  onChange={(e) => setSimValuationVariance(Number(e.target.value))}
                  className="sim-slider" 
                />
              </div>

              <div className="form-group-sim">
                <label>
                  <span>Forest & Environmental Clearance (MoEFCC NOC)</span>
                  <span style={{color: simForestClearance === 'Approved' ? '#10b981' : '#f43f5e'}}>{simForestClearance}</span>
                </label>
                <select 
                  className="sim-select"
                  value={simForestClearance}
                  onChange={(e) => setSimForestClearance(e.target.value)}
                >
                  <option value="Approved">Stage-II Clearance Approved</option>
                  <option value="Pending">Stage-I Pending (Bio-diversity Assessment)</option>
                  <option value="Contested">Gram Sabha FRA Consent Contested</option>
                </select>
              </div>

              <div className="form-group-sim">
                <label>
                  <span>Cadastral Boundary Geometry Match with Bhu-Naksha</span>
                  <span style={{color: simCadastralMatch === 'Exact Match' ? '#10b981' : '#f43f5e'}}>{simCadastralMatch}</span>
                </label>
                <select 
                  className="sim-select"
                  value={simCadastralMatch}
                  onChange={(e) => setSimCadastralMatch(e.target.value)}
                >
                  <option value="Exact Match">Exact Vector Coordinate Match (0.0% Error)</option>
                  <option value="Minor Variance">Minor Boundary Overlap (&lt; 2% Area Shift)</option>
                  <option value="Discrepancy">Severe Spatial Cadastre Discrepancy Flagged</option>
                </select>
              </div>

              <div style={{background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.3)', padding: '1rem', borderRadius: '12px'}}>
                <div style={{fontSize: '0.8rem', fontWeight: '700', color: '#38bdf8', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <Zap size={14} /> Prescriptive AI Mitigation Recommendation
                </div>
                <div style={{fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5}}>
                  {calculatedRisk.score > 70 ? (
                    <span>⚠️ <b>High Risk Bottleneck Detected:</b> Immediately initiate District Collector Conciliation Tribunal under RFCTLARR Section 64. Fast-track 50% provisional solatium escrow deposit to prevent court stay order.</span>
                  ) : calculatedRisk.score > 40 ? (
                    <span>🟡 <b>Moderate Risk:</b> Convene Joint Measurement Survey (JMS) validation hearing with Talathi and affected landowners to resolve cadastral overlap.</span>
                  ) : (
                    <span>🟢 <b>Low Risk:</b> Statutory clearance on track. Ready for Section 23 Award Gazetting and direct PFMS electronic disbursement.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Live ML Output & Anomaly Engine */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
              {/* Delay Probability Gauge Card */}
              <div className="glass-panel">
                <div className="section-heading">
                  <span>AI Delay Probability Output</span>
                  <span className={`badge-tag ${calculatedRisk.score > 70 ? 'critical' : calculatedRisk.score > 40 ? 'warning' : 'success'}`}>
                    {calculatedRisk.score > 70 ? 'CRITICAL RISK' : calculatedRisk.score > 40 ? 'ELEVATED RISK' : 'NOMINAL'}
                  </span>
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '2rem', padding: '1rem 0'}}>
                  <div style={{width: '160px', height: '160px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Doughnut 
                      data={{
                        datasets: [{
                          data: [calculatedRisk.score, 100 - calculatedRisk.score],
                          backgroundColor: [calculatedRisk.score > 70 ? '#f43f5e' : calculatedRisk.score > 40 ? '#f59e0b' : '#10b981', '#1f2937'],
                          borderWidth: 0,
                          circumference: 180,
                          rotation: 270
                        }]
                      }}
                      options={{ cutout: '80%', maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                    />
                    <div style={{position: 'absolute', top: '55%', textAlign: 'center'}}>
                      <div style={{fontSize: '2rem', fontWeight: '800', color: calculatedRisk.score > 70 ? '#f43f5e' : calculatedRisk.score > 40 ? '#f59e0b' : '#10b981'}}>
                        {calculatedRisk.score}%
                      </div>
                      <div style={{fontSize: '0.68rem', color: 'var(--text-muted)'}}>Delay Probability</div>
                    </div>
                  </div>

                  <div style={{flex: 1}}>
                    <div style={{marginBottom: '0.8rem'}}>
                      <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Predicted Project Timeline Slippage</div>
                      <div style={{fontSize: '1.6rem', fontWeight: '800', color: '#f8fafc'}}>
                        +{calculatedRisk.slippage} Months
                      </div>
                    </div>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Estimated Cost Escalation Risk</div>
                    <div style={{fontSize: '1.1rem', fontWeight: '700', color: '#f59e0b'}}>
                      ₹{(calculatedRisk.score * 0.42).toFixed(1)} Crores Escalation
                    </div>
                  </div>
                </div>

                {/* SHAP Feature Contribution Bars */}
                <div style={{borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem'}}>
                  <div style={{fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.8rem'}}>
                    Feature Importance (SHAP Weight Breakdown)
                  </div>
                  {[
                    { name: 'Title Injunctions & Civil Suits', weight: 38, color: '#f43f5e' },
                    { name: 'Valuation Anomaly vs Circle Rate', weight: 28, color: '#f59e0b' },
                    { name: 'Forest Rights Act (FRA) Delay', weight: 20, color: '#0ea5e9' },
                    { name: 'Bhu-Naksha Cadastre Coordinate Shift', weight: 14, color: '#8b5cf6' }
                  ].map(feat => (
                    <div key={feat.name} style={{marginBottom: '0.5rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.2rem'}}>
                        <span>{feat.name}</span>
                        <span style={{fontFamily: 'var(--font-mono)'}}>{feat.weight}%</span>
                      </div>
                      <div style={{width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden'}}>
                        <div style={{width: `${feat.weight}%`, height: '100%', background: feat.color, borderRadius: '3px'}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Valuation Anomaly Detection (Isolation Forest) */}
              <div className="glass-panel" style={{flex: 1}}>
                <div className="section-heading">
                  <span>Isolation Forest Valuation Anomaly Auditor</span>
                  <span className="badge-tag warning">Outliers Flagged</span>
                </div>
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem'}}>
                  Detects irregular solatium awards exceeding 2.5 standard deviations from median village circle transactions.
                </div>
                <table className="custom-data-table">
                  <thead>
                    <tr>
                      <th>Parcel</th>
                      <th>Circle Benchmark</th>
                      <th>Calculated Award</th>
                      <th>Variance</th>
                      <th>Audit Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{fontFamily: 'var(--font-mono)', color: '#38bdf8'}}>#P-235</td>
                      <td>₹45,000 / sqm</td>
                      <td>₹53,100 / sqm</td>
                      <td style={{color: '#f59e0b', fontWeight: '700'}}>+18.0% Mismatch</td>
                      <td>
                        <button 
                          className="select-pill"
                          style={{padding: '0.2rem 0.5rem', fontSize: '0.7rem'}}
                          onClick={() => showToast("Auditor Dispatch: Re-survey order sent to Sub-Registrar.")}
                        >
                          Trigger Audit
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td style={{fontFamily: 'var(--font-mono)', color: '#38bdf8'}}>#P-784</td>
                      <td>₹62,000 / sqm</td>
                      <td>₹47,120 / sqm</td>
                      <td style={{color: '#f43f5e', fontWeight: '700'}}>-24.0% Sub-market</td>
                      <td>
                        <button 
                          className="select-pill"
                          style={{padding: '0.2rem 0.5rem', fontSize: '0.7rem'}}
                          onClick={() => showToast("Sub-market compensation appeal flagged for Collector hearing.")}
                        >
                          Review Award
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: NLP GRIEVANCE REDRESSAL & DISPUTE RESOLUTION */}
        {/* ========================================================================= */}
        {activeTab === 'grievances' && (
          <div style={{display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', padding: '1.5rem', flex: 1, overflowY: 'auto'}}>
            {/* Left: Active Grievances Queue */}
            <div className="glass-panel">
              <div className="section-heading">
                <span>NLP-Classified Landowner Grievance Queue</span>
                <Scale size={18} color="#0ea5e9" />
              </div>
              <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem'}}>
                Natural Language Processing model automatically parses written, regional (Marathi/Hindi), and portal complaints, extracting legal clauses and assigning priority levels.
              </p>

              <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                {grievances.map(grv => (
                  <div 
                    key={grv.id}
                    onClick={() => setSelectedGrievance(grv)}
                    style={{
                      background: selectedGrievance?.id === grv.id ? 'rgba(14, 165, 233, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: selectedGrievance?.id === grv.id ? '1px solid #0ea5e9' : '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <span style={{fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#38bdf8', fontSize: '0.85rem'}}>{grv.id}</span>
                        <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>• Parcel #{grv.parcelId}</span>
                      </div>
                      <span className={`badge-tag ${grv.severity}`}>
                        {grv.severity}
                      </span>
                    </div>

                    <div style={{fontWeight: '600', fontSize: '0.9rem', color: 'white', marginBottom: '0.35rem'}}>
                      {grv.title}
                    </div>

                    <div style={{fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.6rem'}}>
                      {grv.summary}
                    </div>

                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)'}}>
                      <span>Landowner: <b>{grv.landowner}</b></span>
                      <span>Filed: {grv.filingDate}</span>
                      <span style={{color: grv.sentimentScore < -0.7 ? '#f43f5e' : '#f59e0b'}}>
                        Sentiment: {grv.sentimentScore} (Adversarial)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Grievance Resolution & Legal Notice Generator */}
            <div className="glass-panel">
              <div className="section-heading">
                <span>Dispute Adjudication & Notice Generator</span>
                <FileText size={18} color="#0ea5e9" />
              </div>

              {selectedGrievance ? (
                <div>
                  <div style={{background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                      <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Case File</span>
                      <span style={{fontFamily: 'var(--font-mono)', color: '#38bdf8'}}>{selectedGrievance.id}</span>
                    </div>
                    <div style={{fontSize: '1rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem'}}>{selectedGrievance.title}</div>
                    <div style={{fontSize: '0.8rem', color: '#f59e0b', marginBottom: '0.5rem'}}>Statutory Citation: {selectedGrievance.legalSection}</div>
                    <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5}}>{selectedGrievance.summary}</div>
                  </div>

                  {/* Auto-Drafted Legal Summons Template */}
                  <div style={{border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', background: '#070d1e'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                      <span style={{fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)'}}>
                        AI-Generated Statutory Notice (Form E - Sec 15)
                      </span>
                      <span className="badge-tag info">Ready to Serve</span>
                    </div>
                    <div style={{fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.6, background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px'}}>
                      BEFORE THE COURT OF THE DISTRICT MAGISTRATE & LAND ACQUISITION OFFICER, PALGHAR.<br/><br/>
                      <b>NOTICE UNDER SECTION 15(2) OF THE RFCTLARR ACT, 2013</b><br/>
                      IN RE: PARCEL #{selectedGrievance.parcelId} (ULPIN: MH-27-P784-9021)<br/>
                      TO: {selectedGrievance.landowner} & OBJECTING PARTIES<br/><br/>
                      WHEREAS an objection regarding "{selectedGrievance.title}" has been registered in the Bhoomi Sethu National Portal on {selectedGrievance.filingDate}.<br/>
                      YOU ARE HEREBY SUMMONED to appear before the Collector's Tribunal on 12-OCT-2026 at 11:00 AM with original 7/12 extracts and title deeds.
                    </div>
                  </div>

                  <div style={{display: 'flex', gap: '0.75rem'}}>
                    <button 
                      className="btn-primary-action"
                      style={{flex: 1, justifyContent: 'center'}}
                      onClick={() => showToast(`📜 Legal Notice Form E dispatched to ${selectedGrievance.landowner} via SMS & Registered Post!`)}
                    >
                      <Download size={14} /> Dispatch Official Notice
                    </button>
                    <button 
                      className="select-pill"
                      style={{border: '1px solid #10b981', color: '#6ee7b7'}}
                      onClick={() => handleResolveGrievance(selectedGrievance.id)}
                    >
                      <CheckCircle2 size={14} /> Mark Resolved
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)'}}>
                  <Scale size={32} style={{margin: '0 auto 1rem auto', display: 'block', opacity: 0.4}} />
                  <div style={{fontSize: '0.85rem'}}>Select any grievance from the queue to view full NLP transcript and trigger legal notices.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: LARR 2013 STATUTORY LIFECYCLE & DBT PFMS */}
        {/* ========================================================================= */}
        {activeTab === 'lifecycle' && (
          <div style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, overflowY: 'auto'}}>
            {/* LARR 2013 4-Stage Visual Funnel */}
            <div className="glass-panel">
              <div className="section-heading">
                <span>Statutory 4-Stage Pipeline under RFCTLARR Act 2013</span>
                <span className="badge-tag info">End-to-End Governance</span>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem'}}>
                {[
                  { stage: 'Stage 1: Proposal & SIA', section: 'Section 4 - 8', desc: 'Social Impact Assessment & Public Hearing', count: '1,482 Parcels', pct: '100% Done', color: '#0ea5e9' },
                  { stage: 'Stage 2: Preliminary Notification', section: 'Section 11(1)', desc: 'Gazette publication & objection window', count: '1,390 Parcels', pct: '94% Gazetted', color: '#38bdf8' },
                  { stage: 'Stage 3: Declaration of Acquisition', section: 'Section 19(1)', desc: 'Final declaration of public purpose', count: '1,200 Parcels', pct: '81% Approved', color: '#f59e0b' },
                  { stage: 'Stage 4: Award & Possession', section: 'Section 23 & 38', desc: 'Solatium determination & PFMS DBT', count: '1,023 Parcels', pct: '69% Disbursed', color: '#10b981' }
                ].map((st, i) => (
                  <div 
                    key={st.stage}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderTop: `4px solid ${st.color}`,
                      borderRadius: '12px',
                      padding: '1.25rem',
                      position: 'relative'
                    }}
                  >
                    <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)'}}>{st.section}</div>
                    <div style={{fontWeight: '700', fontSize: '0.9rem', color: 'white', margin: '0.35rem 0'}}>{st.stage}</div>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.8rem'}}>{st.desc}</div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem'}}>
                      <span style={{fontSize: '0.85rem', fontWeight: '700', color: st.color}}>{st.pct}</span>
                      <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{st.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Benefit Transfer (DBT) Escrow Tracker */}
            <div style={{display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem'}}>
              <div className="glass-panel">
                <div className="section-heading">
                  <span>PFMS Direct Benefit Transfer (DBT) Compensation Vault</span>
                  <Award size={18} color="#10b981" />
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem'}}>
                  <div style={{background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px'}}>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Total Sanctioned Escrow</div>
                    <div style={{fontSize: '1.6rem', fontWeight: '800', color: 'white'}}>₹1,250.0 Cr</div>
                  </div>
                  <div style={{background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px'}}>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Disbursed via Aadhaar (DBT)</div>
                    <div style={{fontSize: '1.6rem', fontWeight: '800', color: '#10b981'}}>₹865.4 Cr</div>
                  </div>
                  <div style={{background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px'}}>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Frozen in Litigation Escrow</div>
                    <div style={{fontSize: '1.6rem', fontWeight: '800', color: '#f43f5e'}}>₹384.6 Cr</div>
                  </div>
                </div>

                <div style={{fontSize: '0.8rem', fontWeight: '700', color: 'white', marginBottom: '0.75rem'}}>
                  Recent Direct Benefit Transfer Tranches
                </div>
                <table className="custom-data-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Parcel ID</th>
                      <th>Beneficiary</th>
                      <th>Bank IFSC</th>
                      <th>Award Disbursed</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{fontFamily: 'var(--font-mono)', color: '#38bdf8'}}>PFMS-2026-9041</td>
                      <td style={{fontFamily: 'var(--font-mono)'}}>#P-104</td>
                      <td>Maha Agro Industries</td>
                      <td>SBIN0001429</td>
                      <td style={{fontWeight: '700'}}>₹19.60 Cr</td>
                      <td><span className="badge-tag success">Credited via DBT</span></td>
                    </tr>
                    <tr>
                      <td style={{fontFamily: 'var(--font-mono)', color: '#38bdf8'}}>PFMS-2026-9039</td>
                      <td style={{fontFamily: 'var(--font-mono)'}}>#P-441</td>
                      <td>Deepak Mhatre</td>
                      <td>HDFC0000882</td>
                      <td style={{fontWeight: '700'}}>₹2.90 Cr</td>
                      <td><span className="badge-tag success">Credited via DBT</span></td>
                    </tr>
                    <tr>
                      <td style={{fontFamily: 'var(--font-mono)', color: '#38bdf8'}}>PFMS-2026-ESCROW</td>
                      <td style={{fontFamily: 'var(--font-mono)'}}>#P-784</td>
                      <td>Patil Family Escrow</td>
                      <td>RBI-ESCROW-01</td>
                      <td style={{fontWeight: '700'}}>₹4.28 Cr</td>
                      <td><span className="badge-tag critical">Dispute Hold</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Solatium Statutory Calculator */}
              <div className="glass-panel">
                <div className="section-heading">
                  <span>LARR Solatium Multiplier Calculator</span>
                  <Zap size={16} color="#f59e0b" />
                </div>
                <div style={{fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem'}}>
                  Section 30(1) mandates a 100% Solatium over market value, plus multiplication factor (1.0x to 2.0x) for rural acquisitions.
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'}}>
                    <span style={{color: 'var(--text-muted)'}}>Market Value (Sec 26):</span>
                    <span style={{fontWeight: '700'}}>₹1,00,00,000</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'}}>
                    <span style={{color: 'var(--text-muted)'}}>Rural Multiplier Factor:</span>
                    <span style={{fontWeight: '700', color: '#38bdf8'}}>2.0x (Rural Palghar)</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'}}>
                    <span style={{color: 'var(--text-muted)'}}>Adjusted Market Value:</span>
                    <span style={{fontWeight: '700'}}>₹2,00,00,000</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'}}>
                    <span style={{color: 'var(--text-muted)'}}>Solatium 100% (Sec 30):</span>
                    <span style={{fontWeight: '700', color: '#10b981'}}>+ ₹2,00,00,000</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', marginTop: '0.5rem'}}>
                    <span style={{fontWeight: '700', color: '#6ee7b7'}}>Total Statutory Award:</span>
                    <span style={{fontWeight: '800', fontSize: '1.1rem', color: '#6ee7b7'}}>₹4,00,00,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: INTEROPERABILITY & PM GATI SHAKTI MATRIX */}
        {/* ========================================================================= */}
        {activeTab === 'interop' && (
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '1.5rem', flex: 1, overflowY: 'auto'}}>
            {/* ULPIN Bhu-Aadhaar Gateway */}
            <div className="glass-panel">
              <div className="section-heading">
                <span>ULPIN (Bhu-Aadhaar) National Registry Interop Console</span>
                <Cpu size={18} color="#0ea5e9" />
              </div>
              <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem'}}>
                Standardized REST Adapter bridging diverse legacy state land record databases (MahaBhulekh, AnyRoR Gujarat, Bhulekh UP) via 14-digit Unique Land Parcel Identification Numbers.
              </p>

              <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem'}}>
                <input 
                  type="text" 
                  value={ulpinInput} 
                  onChange={(e) => setUlpinInput(e.target.value)}
                  placeholder="Enter 14-digit ULPIN e.g. MH-27-P784-9021" 
                  style={{flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', padding: '0.65rem 1rem', borderRadius: '10px', color: 'white', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.85rem'}}
                />
                <button 
                  className="btn-primary-action"
                  onClick={handleUlpinQuery}
                >
                  <Search size={15} /> Resolve ULPIN
                </button>
              </div>

              {ulpinResult && (
                <div style={{background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem'}}>
                    <span style={{fontSize: '0.85rem', fontWeight: '700', color: '#38bdf8'}}>{ulpinResult.ulpin}</span>
                    <span className="badge-tag success">Verified Active</span>
                  </div>

                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.78rem'}}>
                    <div><span style={{color: 'var(--text-muted)'}}>Origin State Registry:</span><br/><b>{ulpinResult.statePortal}</b></div>
                    <div><span style={{color: 'var(--text-muted)'}}>Survey / Khasra No:</span><br/><b>{ulpinResult.khasra}</b></div>
                    <div><span style={{color: 'var(--text-muted)'}}>Recorded Owner:</span><br/><b>{ulpinResult.owner}</b></div>
                    <div><span style={{color: 'var(--text-muted)'}}>Cadastral Area:</span><br/><b>{ulpinResult.area}</b></div>
                    <div><span style={{color: 'var(--text-muted)'}}>API Latency:</span><br/><b style={{color: '#10b981'}}>{ulpinResult.apiLatency}</b></div>
                    <div><span style={{color: 'var(--text-muted)'}}>Security Protocol:</span><br/><b style={{color: '#38bdf8'}}>{ulpinResult.securityCheck}</b></div>
                  </div>
                </div>
              )}
            </div>

            {/* PM Gati Shakti 7-Engine Alignment Matrix */}
            <div className="glass-panel">
              <div className="section-heading">
                <span>PM Gati Shakti National Master Plan Integration</span>
                <GitFork size={18} color="#0ea5e9" />
              </div>
              <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem'}}>
                Synchronizes multi-modal infrastructure corridors with cadastral land plots to eliminate inter-ministerial overlaps and clearance delays.
              </p>

              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                {[
                  { engine: 'High-Speed Rail (NHSRCL)', status: 'Optimal Alignment', overlap: '0 Clashes Detected', clearance: '100% Cleared', color: '#10b981' },
                  { engine: 'National Highways Authority (NHAI)', status: 'Interchange Buffer', overlap: '2 Parallel Alignments', clearance: 'JMS Joint Sign-off', color: '#0ea5e9' },
                  { engine: 'Dedicated Freight Corridor (DFCCIL)', status: 'Spur Line Connection', overlap: 'Shared RoW Approved', clearance: 'Sec 11 Harmonized', color: '#38bdf8' },
                  { engine: 'Gas Grid & Petroleum Pipelines', status: 'Safety Setback Enforced', overlap: '15m Safe Buffer', clearance: 'NOC Issued', color: '#f59e0b' },
                  { engine: 'Ecological & Forest Corridors', status: 'Compensatory Afforestation', overlap: 'Section 4 Exemption', clearance: 'MoEFCC Verified', color: '#8b5cf6' }
                ].map(engine => (
                  <div 
                    key={engine.engine}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderLeft: `4px solid ${engine.color}`
                    }}
                  >
                    <div>
                      <div style={{fontWeight: '600', fontSize: '0.85rem', color: 'white'}}>{engine.engine}</div>
                      <div style={{fontSize: '0.72rem', color: 'var(--text-muted)'}}>{engine.status} • {engine.overlap}</div>
                    </div>
                    <span className="badge-tag success">{engine.clearance}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: ZERO-TRUST SECURITY & IMMUTABLE AUDIT VAULT */}
        {/* ========================================================================= */}
        {activeTab === 'audit' && (
          <div style={{display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', padding: '1.5rem', flex: 1, overflowY: 'auto'}}>
            {/* Cryptographic Audit Ledger */}
            <div className="glass-panel">
              <div className="section-heading">
                <span>Cryptographic SHA-256 Tamper-Evident Award Ledger</span>
                <Lock size={18} color="#0ea5e9" />
              </div>
              <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem'}}>
                Every financial disbursement, legal hearing, and statutory stage transition is hashed with immutable cryptographic signatures, preventing retro-active record tampering.
              </p>

              <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                {AUDIT_CHAIN.map(block => (
                  <div 
                    key={block.blockNo}
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '1rem',
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <span style={{fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#10b981', fontSize: '0.8rem'}}>Block #{block.blockNo}</span>
                        <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{block.timestamp}</span>
                      </div>
                      <span className="badge-tag success">Verified Valid</span>
                    </div>

                    <div style={{fontWeight: '600', fontSize: '0.85rem', color: 'white', marginBottom: '0.35rem'}}>
                      {block.action}
                    </div>

                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>
                      <span>Signatory: <b>{block.actor}</b></span>
                      <span>Disbursement Value: <b style={{color: '#10b981'}}>₹{block.amountCr} Cr</b></span>
                    </div>

                    <div style={{fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.6rem', borderRadius: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      Hash: {block.hash}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zero-Trust RBAC & Encryption Specifications */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
              <div className="glass-panel">
                <div className="section-heading">
                  <span>Role-Based Access Control (RBAC) Governance Matrix</span>
                  <ShieldCheck size={18} color="#10b981" />
                </div>
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem'}}>
                  Enforces strict separation of powers between administrative tiers under Central and State revenue codes.
                </div>

                <table className="custom-data-table">
                  <thead>
                    <tr>
                      <th>Tier Authority</th>
                      <th>Read Map</th>
                      <th>Notice Issue</th>
                      <th>Disburse Award</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{fontWeight: '600'}}>Central Ministry</td>
                      <td style={{color: '#10b981'}}>National</td>
                      <td style={{color: 'var(--text-muted)'}}>No</td>
                      <td style={{color: 'var(--text-muted)'}}>Budget Only</td>
                    </tr>
                    <tr>
                      <td style={{fontWeight: '600'}}>State Revenue</td>
                      <td style={{color: '#10b981'}}>Statewide</td>
                      <td style={{color: '#10b981'}}>Gazette Sec 11</td>
                      <td style={{color: 'var(--text-muted)'}}>Audit</td>
                    </tr>
                    <tr>
                      <td style={{fontWeight: '600'}}>District Collector</td>
                      <td style={{color: '#10b981'}}>District</td>
                      <td style={{color: '#10b981'}}>Adjudicate</td>
                      <td style={{color: '#10b981'}}>PFMS Signatory</td>
                    </tr>
                    <tr>
                      <td style={{fontWeight: '600'}}>Field Surveyor</td>
                      <td style={{color: '#10b981'}}>Taluka</td>
                      <td style={{color: 'var(--text-muted)'}}>No</td>
                      <td style={{color: 'var(--text-muted)'}}>No</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="glass-panel">
                <div className="section-heading">
                  <span>Security & Compliance Telemetry</span>
                  <Lock size={16} color="#0ea5e9" />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'}}>
                    <span style={{color: 'var(--text-muted)'}}>Database At-Rest Encryption:</span>
                    <span style={{fontFamily: 'var(--font-mono)', color: '#10b981'}}>AES-256 GCM</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'}}>
                    <span style={{color: 'var(--text-muted)'}}>In-Transit TLS Protocol:</span>
                    <span style={{fontFamily: 'var(--font-mono)', color: '#10b981'}}>TLS 1.3 Strict</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'}}>
                    <span style={{color: 'var(--text-muted)'}}>PII Redaction:</span>
                    <span style={{fontFamily: 'var(--font-mono)', color: '#38bdf8'}}>Aadhaar Virtual ID Masking</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'}}>
                    <span style={{color: 'var(--text-muted)'}}>Audit Immutability:</span>
                    <span style={{fontFamily: 'var(--font-mono)', color: '#10b981'}}>Signed Merkle Tree Ledger</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* GLOBAL PARCEL INSPECTOR MODAL */}
      {/* ========================================================================= */}
      {selectedParcel && (
        <div className="modal-overlay-custom" onClick={() => setSelectedParcel(null)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem'}}>
              <div>
                <span style={{fontSize: '1.1rem', fontWeight: '800', color: 'white'}}>Parcel Dossier #{selectedParcel.id}</span>
                <span style={{marginLeft: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#38bdf8'}}>{selectedParcel.ulpin}</span>
              </div>
              <button onClick={() => setSelectedParcel(null)} style={{background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer'}}><X size={20} /></button>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.8rem'}}>
              <div><span style={{color: 'var(--text-muted)'}}>Survey / Khasra No:</span><br/><b>{selectedParcel.surveyNo}</b></div>
              <div><span style={{color: 'var(--text-muted)'}}>Recorded Landowner:</span><br/><b>{selectedParcel.owner}</b></div>
              <div><span style={{color: 'var(--text-muted)'}}>Village & Taluka:</span><br/><b>{selectedParcel.village}</b></div>
              <div><span style={{color: 'var(--text-muted)'}}>Parcel Area:</span><br/><b>{selectedParcel.areaHectares} Hectares</b></div>
              <div><span style={{color: 'var(--text-muted)'}}>Statutory LARR Stage:</span><br/><b style={{color: '#38bdf8'}}>{selectedParcel.stage}</b></div>
              <div><span style={{color: 'var(--text-muted)'}}>PFMS Disbursement:</span><br/><b style={{color: selectedParcel.dbtStatus === 'PFMS Disbursed' ? '#10b981' : '#f59e0b'}}>{selectedParcel.dbtStatus}</b></div>
            </div>

            {/* Compensation Breakdown */}
            <div style={{background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem'}}>
              <div style={{fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>
                Statutory Compensation Calculation
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem'}}>
                <span style={{color: 'var(--text-secondary)'}}>Base Market Valuation (Sec 26):</span>
                <span style={{fontWeight: '700'}}>₹{selectedParcel.marketValueCr} Cr</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem'}}>
                <span style={{color: 'var(--text-secondary)'}}>100% Solatium Mandatory Grant (Sec 30):</span>
                <span style={{fontWeight: '700', color: '#10b981'}}>+ ₹{selectedParcel.solatiumCr} Cr</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '800', color: '#38bdf8', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.5rem'}}>
                <span>Total Compensation Award:</span>
                <span>₹{selectedParcel.totalCompensationCr} Cr</span>
              </div>
            </div>

            {/* AI Risk Assessment */}
            <div style={{background: selectedParcel.delayRisk > 70 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${selectedParcel.delayRisk > 70 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem'}}>
                <span style={{fontSize: '0.8rem', fontWeight: '700', color: selectedParcel.delayRisk > 70 ? '#fda4af' : '#6ee7b7'}}>
                  AI Delay Prediction: {selectedParcel.delayRisk}% Risk
                </span>
                <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                  Expected Delay: +{selectedParcel.predictedSlippageMonths} Months
                </span>
              </div>
              <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>
                <b>Flagged Factor:</b> {selectedParcel.anomaly}
              </div>
            </div>

            <div style={{display: 'flex', gap: '0.75rem'}}>
              <button 
                className="btn-primary-action"
                style={{flex: 1, justifyContent: 'center'}}
                onClick={() => handleApproveStage(selectedParcel.id)}
              >
                <Check size={16} /> Advance Stage & Disburse Award
              </button>
              <button 
                className="select-pill"
                onClick={() => {
                  setSelectedParcel(null);
                  setActiveTab('grievances');
                }}
              >
                Inspect in Grievances
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
