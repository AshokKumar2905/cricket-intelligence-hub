import { useState } from "react";
import api from "../api";
import { useToast } from "../context/ToastContext";

export default function DataUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { addToast } = useToast();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && !selectedFile.name.endsWith('.csv')) {
      addToast("DATASET_REJECTION: Only CSV formats authorized.", "error");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      addToast("UPLINK_ERROR: Please attach a CSV dataset.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await api.post("/import-dataset", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const count = res.data.data?.count || 0;
      addToast(`INTEL_SYNC_COMPLETE: ${count.toLocaleString()} deliveries processed.`, "success");
      setFile(null); 
    } catch (err) {
      addToast("ANALYSIS_FAILED: Universal mapping engine mismatch.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm("CRITICAL_PROTOCOL: Permanently purge all athlete intelligence?")) {
        try {
            await api.delete("/reset-all");
            addToast("GLOBAL_CACHE_PURGED.");
            setFile(null);
        } catch (err) {
            addToast("SYSTEM_ERROR: Purge sequence failed.", "error");
        }
    }
  };

  return (
    <div className="page-fade-in" style={containerStyle}>
      <div style={innerWrapper}>
        <span style={labelTag}>SYSTEM_CORE_UPLINK</span>
        <h1 style={titleStyle}>DATA_INGESTION</h1>
        <p style={subtitleStyle}>
          Ingest raw ball-by-ball datasets. The engine automatically maps identifiers for Cricsheet and International formats.
        </p>

        <div className="glass-card" style={dropZone}>
          <div style={{ marginBottom: "20px" }}>
            <label style={fileLabel}>
                <span style={{ color: file ? "#00f2ff" : "#64748b", fontWeight: "900", fontSize: "13px", letterSpacing: '2px' }}>
                  {file ? `📂 ${file.name.toUpperCase()}` : "📁 ATTACH_RAW_STREAM"}
                </span>
                <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />
            </label>
          </div>

          <button 
            onClick={handleUpload} 
            disabled={uploading || !file}
            style={{
              ...primaryBtn,
              opacity: (uploading || !file) ? 0.4 : 1,
              background: uploading ? "#1e293b" : "#00f2ff",
              color: uploading ? "#94a3b8" : "#000"
            }}
          >
            {uploading ? "ANALYZING_PANDAS_STREAM..." : "COMMIT_TO_DATABASE"}
          </button>

          <button onClick={handleReset} style={secondaryBtn}>
            PURGE_GLOBAL_CACHE
          </button>
        </div>

        <div className="glass-card" style={formatGuide}>
          <h4 style={guideHeader}>ACTIVE_ENGINE_MAPPINGS:</h4>
          <div style={guideGrid}>
             <div style={guideItem}>
                <strong style={strongStyle}>BATTING</strong>
                <p style={pStyle}>striker, batter, runs_off_bat</p>
             </div>
             <div style={guideItem}>
                <strong style={strongStyle}>BOWLING</strong>
                <p style={pStyle}>over, bowler, bowling_team</p>
             </div>
             <div style={guideItem}>
                <strong style={strongStyle}>IDENTIFIERS</strong>
                <p style={pStyle}>match_id, player, team</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= TACTICAL STYLES ================= */
const containerStyle = { padding: "80px 5%", background: "transparent", minHeight: "100vh", color: "white" };
const innerWrapper = { maxWidth: "700px", margin: "0 auto", textAlign: "center" };
const labelTag = { color: "#00f2ff", fontWeight: "900", letterSpacing: "5px", fontSize: "10px" };
const titleStyle = { fontSize: "48px", fontWeight: "900", margin: "10px 0", letterSpacing: "-2px" };
const subtitleStyle = { color: "#94a3b8", marginBottom: "40px", lineHeight: "1.6", fontSize: "14px", opacity: 0.8 };
const dropZone = { background: "rgba(0,0,0,0.4)", padding: "40px", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "2px" };
const fileLabel = { display: "block", background: "rgba(0, 0, 0, 0.6)", padding: "50px", borderRadius: "2px", cursor: "pointer", border: "1px dashed rgba(0, 242, 255, 0.2)", transition: "0.2s" };
const primaryBtn = { width: "100%", padding: "18px", border: "none", fontWeight: "900", fontSize: "12px", letterSpacing: "2px", marginBottom: "15px", borderRadius: "2px", cursor: "pointer" };
const secondaryBtn = { width: "100%", background: "transparent", color: "#ff0055", padding: "12px", border: "1px solid rgba(255, 0, 85, 0.2)", fontWeight: "800", cursor: "pointer", fontSize: "9px", letterSpacing: "1px" };
const formatGuide = { marginTop: "40px", padding: "30px", borderLeft: "3px solid #00f2ff", textAlign: "left", background: "rgba(0,0,0,0.2)" };
const guideHeader = { color: "#00f2ff", fontSize: "9px", marginBottom: "20px", fontWeight: '900', letterSpacing: "2px" };
const guideGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' };
const guideItem = { fontSize: '11px' };
const strongStyle = { color: '#fff', display: 'block', marginBottom: '5px', fontSize: '10px', letterSpacing: '1px' };
const pStyle = { color: '#64748b', margin: 0, fontSize: '10px' };