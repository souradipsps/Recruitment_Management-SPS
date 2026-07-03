import { T } from "../../theme";
import { Btn } from "../../components/ui";

export default function JobRequestSentBackBanner({ requests, onView }) {
  return requests
    .filter((r) => r.status === "Sent Back")
    .map((r) => (
      <div
        key={r.id}
        style={{
          background: T.amberLight,
          border: `1px solid #FDE68A`,
          borderRadius: 10,
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1 }}>
          <strong style={{ color: T.amber, fontSize: 13 }}>Action Required (Sent Back): </strong>
          <span style={{ fontSize: 13, color: T.ink }}>
            Job Request for <strong>{r.role}</strong> was returned with comment: <em>...</em>
          </span>
        </div>
        <Btn label="View Request" small variant="amber" onClick={() => onView(r)} />
      </div>
    ));
}
