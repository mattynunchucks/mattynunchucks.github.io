export function SaveModal({ saveModal, setSaveModal }) {
  if (!saveModal) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}
      onClick={() => setSaveModal(null)}
    >
      <div onClick={e => e.stopPropagation()} style={{ background: "#0a1020", border: "1px solid #6bcb77", borderRadius: "10px", padding: "20px", width: "100%", maxWidth: "560px" }}>
        <div style={{ fontSize: "0.75rem", color: "#6bcb77", letterSpacing: "0.2em", marginBottom: "12px" }}>💾 SAVE DATA</div>
        <textarea
          readOnly
          value={saveModal}
          style={{ width: "100%", height: "90px", background: "#060910", border: "1px solid #1a2a40", borderRadius: "5px", color: "#88bbff", fontSize: "0.5rem", fontFamily: "'Courier New', monospace", padding: "8px", resize: "none", wordBreak: "break-all", outline: "none" }}
        />
        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          <button onClick={() => navigator.clipboard?.writeText(saveModal)} style={{ flex: 1, background: "#0a1a10", border: "1px solid #6bcb77", borderRadius: "5px", color: "#6bcb77", padding: "8px", cursor: "pointer", fontSize: "0.6rem", letterSpacing: "0.1em", fontFamily: "'Courier New', monospace" }}>📋 COPY</button>
          <button onClick={() => setSaveModal(null)} style={{ background: "transparent", border: "1px solid #2a3a50", borderRadius: "5px", color: "#4466aa", padding: "8px 16px", cursor: "pointer", fontSize: "0.6rem", fontFamily: "'Courier New', monospace" }}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}

export function LoadModal({ show, theme, pasteText, setPasteText, pasteError, setPasteError, onPasteLoad, onImportFile, onClose }) {
  if (!show) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{ background: "#0a1020", border: "1px solid #4d96ff", borderRadius: "10px", padding: "20px", width: "100%", maxWidth: "560px" }}>
        <div style={{ fontSize: "0.75rem", color: "#4d96ff", letterSpacing: "0.2em", marginBottom: "12px" }}>📂 LOAD SAVE</div>
        <div style={{ fontSize: "0.58rem", color: theme.textDim, marginBottom: "6px" }}>Paste save text below, or load from a file:</div>
        <textarea
          value={pasteText}
          onChange={e => { setPasteText(e.target.value); setPasteError(""); }}
          placeholder="Paste save data here (CGUv1:...)..."
          style={{ width: "100%", height: "90px", background: "#060910", border: `1px solid ${pasteError ? "#ff6b6b" : pasteText.trim() ? "#4d96ff66" : "#1a2a40"}`, borderRadius: "5px", color: "#88bbff", fontSize: "0.5rem", fontFamily: "'Courier New', monospace", padding: "8px", resize: "none", wordBreak: "break-all", outline: "none" }}
        />
        {pasteError && <div style={{ fontSize: "0.55rem", color: "#ff6b6b", marginTop: "5px" }}>✗ {pasteError}</div>}
        <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
          <button onClick={onPasteLoad} disabled={!pasteText.trim()} style={{ flex: 1, background: pasteText.trim() ? "#0a1a30" : "transparent", border: `1px solid ${pasteText.trim() ? "#4d96ff" : "#1a2a40"}`, borderRadius: "5px", color: pasteText.trim() ? "#4d96ff" : "#2a3a50", padding: "8px", cursor: pasteText.trim() ? "pointer" : "not-allowed", fontSize: "0.6rem", letterSpacing: "0.1em", fontFamily: "'Courier New', monospace" }}>LOAD FROM TEXT</button>
          <label style={{ flex: 1, background: "#0a1a10", border: "1px solid #6bcb7788", borderRadius: "5px", color: "#6bcb77", padding: "8px", cursor: "pointer", fontSize: "0.6rem", letterSpacing: "0.1em", fontFamily: "'Courier New', monospace", textAlign: "center" }}>
            📁 LOAD FILE
            <input type="file" accept=".txt,.json" onChange={onImportFile} style={{ display: "none" }} />
          </label>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid #2a3a50", borderRadius: "5px", color: "#4466aa", padding: "8px 16px", cursor: "pointer", fontSize: "0.6rem", fontFamily: "'Courier New', monospace" }}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}

export function DeleteConfirmModal({ show, theme, onConfirm, onCancel }) {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#0a1020", border: "2px solid #ff6b6b", borderRadius: "10px", padding: "24px", maxWidth: "340px", textAlign: "center" }}>
        <div style={{ fontSize: "0.78rem", color: "#ff6b6b", letterSpacing: "0.2em", marginBottom: "10px" }}>DELETE SAVE?</div>
        <div style={{ fontSize: "0.6rem", color: theme.textDim, marginBottom: "18px" }}>This will permanently erase all progress. There is no undo.</div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={onConfirm} style={{ background: "#ff6b6b22", border: "1px solid #ff6b6b", borderRadius: "5px", color: "#ff6b6b", padding: "8px 22px", cursor: "pointer", fontSize: "0.62rem", letterSpacing: "0.15em", fontFamily: "'Courier New', monospace" }}>DELETE</button>
          <button onClick={onCancel} style={{ background: "transparent", border: "1px solid #2a3a50", borderRadius: "5px", color: "#4466aa", padding: "8px 22px", cursor: "pointer", fontSize: "0.62rem", letterSpacing: "0.15em", fontFamily: "'Courier New', monospace" }}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}
