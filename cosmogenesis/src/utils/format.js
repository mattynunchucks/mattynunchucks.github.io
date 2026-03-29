export function fmt(n) {
  if (!isFinite(n) || isNaN(n) || n < 0) return "0";
  if (n < 1e3)  return n.toFixed(n < 10 ? 1 : 0);
  if (n < 1e6)  return (n / 1e3).toFixed(2)  + "K";
  if (n < 1e9)  return (n / 1e6).toFixed(2)  + "M";
  if (n < 1e12) return (n / 1e9).toFixed(2)  + "B";
  if (n < 1e15) return (n / 1e12).toFixed(2) + "T";
  return (n / 1e15).toFixed(2) + "Qa";
}

export function fmtTime(secs) {
  if (secs < 60)   return `${Math.floor(secs)}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ${Math.floor(secs % 60)}s`;
  return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
}
