import { T, font } from "../../theme";
import { Card } from "../../components/ui";

export default function RoleCardGrid({ totalRoles, activeRoles, inactiveRoles, isMobile }) {
  const cards = [
    { label: "Total Roles", value: totalRoles, color: T.blue },
    { label: "Active Roles", value: activeRoles, color: T.green },
    { label: "Inactive", value: inactiveRoles, color: T.amber },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
      {cards.map((card, idx) => (
        <div key={card.label} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.06}s` }}>
          <Card style={{ padding: isMobile ? 14 : 18 }}>
            <div className="animate-count-up" style={{ fontSize: isMobile ? font['2xl'] : font['3xl'], fontWeight: font.black, fontFamily: font.heading, color: card.color, animationDelay: `${idx * 0.06 + 0.1}s` }}>{card.value}</div>
            <div style={{ fontSize: font.sm + 1, fontWeight: font.bold, fontFamily: font.body, color: T.ink, marginTop: 4 }}>{card.label}</div>
          </Card>
        </div>
      ))}
    </div>
  );
}
