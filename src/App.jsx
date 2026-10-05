import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
} from 'chart.js';
import { Database, ShieldAlert, Activity } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip);

const generateParcels = () => {
  const features = [];
  const centerLat = 19.0760;
  const centerLng = 72.8777;
  const statuses = ['discovery', 'negotiation', 'dispute', 'acquired'];
  
  for(let i=0; i<30; i++) {
    const lat = centerLat + (Math.random() - 0.5) * 0.05;
    const lng = centerLng + (Math.random() - 0.5) * 0.05;
    const size = 0.002 + Math.random() * 0.003;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    features.push({
      "type": "Feature",
      "properties": { "status": status, "id": "P" + Math.floor(Math.random()*1000) },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [lng, lat], [lng+size, lat], [lng+size, lat+size], [lng, lat+size], [lng, lat]
        ]]
      }
    });
  }
  return { "type": "FeatureCollection", "features": features };
};

const getColor = (status) => {
  if(status === 'discovery') return '#58a6ff';
  if(status === 'negotiation') return '#d29922';
  if(status === 'dispute') return '#f85149';
  return '#3fb950';
};

const App = () => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    // Simulate fetching from backend
    setTimeout(() => {
      setGeoData(generateParcels());
    }, 500);
  }, []);

  return (
    <div className="dashboard-container">
      <header>
        <div className="logo" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <Database color="#58a6ff" /> BHOOMI SETHU <span>AI</span>
        </div>
        <div style={{display: 'flex', gap: '20px', fontSize: '0.9rem', color: 'var(--text-muted)'}}>
          <span>State: Maharashtra</span>
          <span>Role: Admin</span>
        </div>
      </header>

      <div className="main-content">
        
        {/* LEFT PANEL */}
        <div className="side-panel">
          <div className="panel-card">
            <div className="panel-title" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
              <Activity size={16} /> Acquisition Summary
            </div>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-label">Active Parcels</div>
                <div className="stat-value">1,482</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Pending</div>
                <div className="stat-value warning">231</div>
              </div>
              <div className="stat-box" style={{gridColumn: 'span 2'}}>
                <div className="stat-label">Target Area (Hectares)</div>
                <div className="stat-value" style={{color: '#58a6ff'}}>12,540</div>
              </div>
            </div>
          </div>

          <div className="panel-card" style={{flex: 1}}>
            <div className="panel-title" style={{display: 'flex', justifyContent: 'space-between'}}>
              <span>AI Delay Risk</span>
              <span style={{color: 'var(--accent-red)'}}>Critical</span>
            </div>
            <div style={{height: '150px', position: 'relative', display: 'flex', justifyContent: 'center'}}>
              <Doughnut 
                data={{
                  datasets: [{
                    data: [87, 13],
                    backgroundColor: ['#f85149', '#21262d'],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270
                  }]
                }}
                options={{ cutout: '80%', maintainAspectRatio: false }}
              />
              <div style={{position: 'absolute', top: '50%', textAlign: 'center'}}>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-red)'}}>87%</div>
                <div style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>Probability</div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER MAP */}
        <div className="map-container">
          <div className="map-overlay">
            <div style={{fontWeight: 'bold', marginBottom: '10px', fontSize: '0.9rem'}}>Live Parcel Tracking</div>
            <div className="legend-item"><div className="legend-color" style={{background: '#58a6ff'}}></div> Discovery / Survey</div>
            <div className="legend-item"><div className="legend-color" style={{background: '#d29922'}}></div> Negotiation / Notice</div>
            <div className="legend-item"><div className="legend-color" style={{background: '#f85149'}}></div> Dispute / Delay</div>
            <div className="legend-item"><div className="legend-color" style={{background: '#3fb950'}}></div> Possession Acquired</div>
          </div>
          <MapContainer center={[19.0760, 72.8777]} zoom={13} style={{ height: '100%', width: '100%', background: '#0d1117' }} zoomControl={false}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; CARTO"
            />
            {geoData && (
              <GeoJSON 
                data={geoData} 
                style={(feature) => ({
                  color: getColor(feature.properties.status),
                  weight: 2,
                  fillOpacity: 0.3
                })}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(`<b>Parcel:</b> ${feature.properties.id}<br><b>Status:</b> ${feature.properties.status}`);
                }}
              />
            )}
          </MapContainer>
        </div>

        {/* RIGHT PANEL */}
        <div className="side-panel">
          <div className="panel-card">
            <div className="panel-title" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
              <ShieldAlert size={16} /> Auto-Classified Grievances
            </div>
            <div className="grievance-item">
              <div className="grievance-header">
                <span>Title Dispute</span>
                <span className="badge critical">Critical</span>
              </div>
              <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Parcel #P784 • Detected 2 hrs ago</div>
            </div>
            <div className="grievance-item warning">
              <div className="grievance-header">
                <span>Valuation Anomaly</span>
                <span className="badge warning">Warning</span>
              </div>
              <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Parcel #P235 • 18% mismatch</div>
            </div>
            <div className="grievance-item review">
              <div className="grievance-header">
                <span>Missing Docs</span>
                <span className="badge review">Review</span>
              </div>
              <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Parcel #P912 • Wait on Node</div>
            </div>
          </div>

          <div className="panel-card" style={{flex: 1}}>
            <div className="panel-title">Stage Breakdown</div>
            <div style={{height: '200px'}}>
              <Bar 
                data={{
                  labels: ['Discovery', 'Negotiation', 'Dispute', 'Acquired'],
                  datasets: [{
                    data: [35, 25, 10, 30],
                    backgroundColor: ['#58a6ff', '#d29922', '#f85149', '#3fb950']
                  }]
                }}
                options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
