
export function formatDuration(s: number) {
  const sec = Math.max(0, Math.floor(s || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const ss = sec % 60;
  const mm = String(m).padStart(2, '0');
  const sss = String(ss).padStart(2, '0');
  return h ? `${h}:${mm}:${sss}` : `${m}:${sss}`;
}


export const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('uk-UA', { year: 'numeric', month: 'short', day: '2-digit' });
};
