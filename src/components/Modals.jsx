export function DeleteConfirmModal({ show, theme, onConfirm, onCancel }) {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#0a1020", border: "2px solid #ff6b6b", borderRadius: "10px", padding: "24px", maxWidth: "340px", textAlign: "center" }}>
        <div style={{ fontSize: "0.78rem", color: "#ff6b6b", letterSpacing: "0.2em", marginBottom: "10px" }}>DELETE CLOUD SAVE?</div>
        <div style={{ fontSize: "0.6rem", color: theme.textDim, marginBottom: "18px" }}>This will permanently erase your cloud save and reset all progress. There is no undo.</div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={onConfirm} style={{ background: "#ff6b6b22", border: "1px solid #ff6b6b", borderRadius: "5px", color: "#ff6b6b", padding: "8px 22px", cursor: "pointer", fontSize: "0.62rem", letterSpacing: "0.15em", fontFamily: "'Courier New', monospace" }}>DELETE</button>
          <button onClick={onCancel} style={{ background: "transparent", border: "1px solid #2a3a50", borderRadius: "5px", color: "#4466aa", padding: "8px 22px", cursor: "pointer", fontSize: "0.62rem", letterSpacing: "0.15em", fontFamily: "'Courier New', monospace" }}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}
