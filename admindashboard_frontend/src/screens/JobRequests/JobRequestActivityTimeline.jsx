import { T } from "../../theme";

const labelStyle = { fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em" };

export default function JobRequestActivityTimeline({ history }) {
  if (!history?.length) return null;

  return (
    <div>
      <div style={{ ...labelStyle, marginBottom: 12 }}>Activity History</div>
      {history.map((h, i) => {
        const isLast = i === history.length - 1;
        return (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: isLast ? T.blue : T.border, marginTop: 3, flexShrink: 0 }} />
              {!isLast && <div style={{ width: 2, flex: 1, background: T.border, margin: "3px 0" }} />}
            </div>
            <div style={{ paddingBottom: isLast ? 0 : 4 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>
                {h.act} <span style={{ fontWeight: 400, color: T.inkLight }}>by {h.by}</span>
              </div>
              <div style={{ fontSize: 11, color: T.inkFaint }}>{h.date}</div>
              {h.note && (
                <div style={{ marginTop: 4, fontSize: 12, color: T.amber, background: T.amberLight, padding: "6px 10px", borderRadius: 7, border: `1px solid #FDE68A` }}>
                  {h.note}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
