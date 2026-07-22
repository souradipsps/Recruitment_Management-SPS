import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { T, font, radius, shadow, transition } from "../theme";
import { useBreakpoint } from "../hooks";
import { Card, Btn, SectionTitle } from "../components/ui";
import { EXISTING_ROLES } from "../data";
import useDashboardCharts from "./useDashboardCharts";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard({
  approvalRequests = [],
  jobPostings = [],
  jobApplications = [],
  generalApplications = [],
  interviews = [],
  offers = [],
  existingRoles = [],
  stats = null,
  navigate,
}) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  const [activeFilter, setActiveFilter] = useState("all");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [chartView, setChartView] = useState("grouped"); // "grouped" | "dual" | "hiresOnly"
  const [deptView, setDeptView] = useState("stacked"); // "stacked" | "grouped" | "fillRate"
  const [funnelView, setFunnelView] = useState("doughnut"); // "doughnut" | "funnelBars" | "rates"
  const [budgetView, setBudgetView] = useState("roleAllocation"); // "roleAllocation" | "costPerHire" | "empTypeBreakdown" | "expBreakdown" | "deptSummary"
  const [selectedBudgetDept, setSelectedBudgetDept] = useState("all");
  const [selectedBudgetEmpType, setSelectedBudgetEmpType] = useState("all"); // "all" | "Full-time" | "Part-time"
  const [selectedBudgetExp, setSelectedBudgetExp] = useState("all"); // "all" | "1-2" | "2-4" | "3-5"
  const [showAllActivityModal, setShowAllActivityModal] = useState(false);
  const [activityModalFilter, setActivityModalFilter] = useState("All");
  const [activityModalSearch, setActivityModalSearch] = useState("");

  const exportToCSV = () => {
    const data = [
      ["Recruitment Summary Metrics", "Value", "Trend / Details"],
      ["Open Positions", activePostingsCount, `${postingsThisMonthCount} active this month`],
      ["Pending Approvals", pendingCount, pendingCount > 0 ? "Requires action" : "All cleared"],
      ["Total Applicants", totalAppsCount, `+${appsThisMonth} this month`],
      ["Interviews Scheduled", scheduledInterviewsCount, `${next7DaysCount} next 7 days`],
      ["Offers Released", offersCount, `${draftOffersCount} draft, ${sentOffersCount} sent`],
      ["New Joiners", newJoinersCount, "Joining July 2026"],
    ];

    let csvContent = "data:text/csv;charset=utf-8," 
      + data.map(e => e.map(val => `"${val}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Recruitment_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Recruitment Dashboard Summary Report - South Point School</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 40px; }
            .header { border-bottom: 3px solid #72102a; padding-bottom: 20px; margin-bottom: 30px; display: flex; align-items: center; }
            .logo { font-size: 24px; font-weight: 800; color: #72102a; }
            .title { font-size: 28px; font-weight: 900; margin-top: 10px; }
            .date { font-size: 14px; color: #64748b; margin-top: 5px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; }
            .card { border: 1px solid #e2e8f0; padding: 20px; borderRadius: 8px; background: #fff; }
            .card-title { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
            .card-value { font-size: 32px; font-weight: 900; color: #0f172a; }
            .card-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
            .footer { margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">South Point School</div>
              <div class="title">Recruitment Dashboard Summary Report</div>
              <div class="date">Generated on ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-title">Open Positions</div>
              <div class="card-value">${activePostingsCount}</div>
              <div class="card-sub">${postingsThisMonthCount} active this month</div>
            </div>
            <div class="card">
              <div class="card-title">Pending Approvals</div>
              <div class="card-value">${pendingCount}</div>
              <div class="card-sub">${pendingCount > 0 ? "Requires action" : "All cleared"}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Applicants</div>
              <div class="card-value">${totalAppsCount}</div>
              <div class="card-sub">Across active job roles</div>
            </div>
            <div class="card">
              <div class="card-title">Interviews Scheduled</div>
              <div class="card-value">${scheduledInterviewsCount}</div>
              <div class="card-sub">${next7DaysCount} next 7 days</div>
            </div>
            <div class="card">
              <div class="card-title">Offers Released</div>
              <div class="card-value">${offersCount}</div>
              <div class="card-sub">${draftOffersCount} draft • ${sentOffersCount} sent</div>
            </div>
            <div class="card">
              <div class="card-title">New Joiners</div>
              <div class="card-value">${newJoinersCount}</div>
              <div class="card-sub">Joining July 2026</div>
            </div>
          </div>

          <div class="footer">
            Confidential - Internal Recruitment Document. South Point School Guwahati, Assam.
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Derived real data
  const pendingCount = stats ? stats.pendingApprovals : (approvalRequests || []).filter((r) => r.status === "Pending").length;
  const activePostingsCount = stats ? stats.openPositions : (jobPostings || []).filter((p) => p.status === "Published" || p.status === "Active").length;
  const totalAppsCount = stats ? stats.totalApplicants : ((jobApplications || []).length + (generalApplications || []).length);
  const scheduledInterviewsCount = stats ? stats.interviewsScheduled : (interviews || []).filter((i) => i.status === "Scheduled").length;
  const offersCount = stats ? stats.offersReleased : (offers || []).length;
  const newJoinersCount = stats ? stats.newJoiners : (offers || []).filter((o) => o.status === "Accepted" || o.status === "Joined").length;

  // Real dynamic metadata for KPI cards
  const now = new Date();
  const currentMonthYearName = now.toLocaleString("default", { month: "long", year: "numeric" });

  const postingsThisMonthCount = (jobPostings || []).filter((p) => {
    if (!p.posted) return false;
    const d = new Date(p.posted);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const appsThisMonth = [...(jobApplications || []), ...(generalApplications || [])].filter((a) => {
    if (!a.applied) return false;
    const d = new Date(a.applied);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const next7DaysCount = (interviews || []).filter((i) => {
    if (i.status !== "Scheduled" || !i.date) return false;
    const d = new Date(i.date);
    const diffTime = d - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  const draftOffersCount = (offers || []).filter((o) => o.status === "Draft").length;
  const sentOffersCount = (offers || []).filter((o) => o.status === "Sent" || o.status === "Offer Sent").length;

  const offersThisMonth = (offers || []).filter((o) => {
    if (!o.issued) return false;
    const d = new Date(o.issued);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Primary KPIs
  const kpis = [
    {
      label: "Open Positions",
      value: activePostingsCount,
      icon: "📋",
      color: T.primary,
      bg: T.primaryLight,
      sub: postingsThisMonthCount > 0 ? `+${postingsThisMonthCount} active this month` : "No new postings",
      trend: "Active",
      nav: "job-postings",
    },
    {
      label: "Pending Approvals",
      value: pendingCount,
      icon: "⏳",
      color: pendingCount > 0 ? T.red : T.accentDark,
      bg: pendingCount > 0 ? T.redLight : T.accentLight,
      sub: pendingCount > 0 ? "Requires action" : "All cleared",
      trend: pendingCount > 0 ? "Action Needed" : "Clean",
      nav: "approval-requests",
    },
    {
      label: "Total Applicants",
      value: totalAppsCount,
      icon: "👥",
      color: T.teal,
      bg: T.tealLight,
      sub: "Across active job roles",
      trend: appsThisMonth > 0 ? `+${appsThisMonth} this month` : "Steady",
      nav: "applications",
    },
    {
      label: "Interviews Scheduled",
      value: scheduledInterviewsCount,
      icon: "🗓",
      color: T.violet,
      bg: T.violetLight,
      sub: next7DaysCount > 0 ? `${next7DaysCount} next 7 days` : "No upcoming",
      trend: "Scheduled",
      nav: "interview-panel",
    },
    {
      label: "Offers Released",
      value: offersCount,
      icon: "📨",
      color: T.green,
      bg: T.greenLight,
      sub: `${draftOffersCount} draft • ${sentOffersCount} sent`,
      trend: offersThisMonth > 0 ? `+${offersThisMonth} this month` : "Active",
      nav: "offer-management",
    },
    {
      label: "New Joiners",
      value: newJoinersCount,
      icon: "🎉",
      color: T.primary,
      bg: T.primaryLight,
      sub: `Joining ${currentMonthYearName}`,
      trend: "Onboarding",
      nav: "onboarding",
    },
  ];

  const {
    monthlyChartData,
    monthlyChartOptions,
    funnelStages,
    funnelDoughnutData,
    funnelDoughnutOptions,
    centerTextPlugin,
    shortlistedCount,
    selectedCount,
    safeOffersCount,
    deptChartData,
    deptChartOptions,
    availableDepts,
    availableEmpTypes,
    availableExps,
    filteredRoleBudgetData,
    totalTargetHires,
    totalFilledHires,
    totalAllocatedBudget,
    totalActualSpend,
    budgetChartData,
    budgetChartOptions,
    activity,
    allActivity,
  } = useDashboardCharts({
    approvalRequests,
    jobPostings,
    jobApplications,
    generalApplications,
    interviews,
    offers,
    existingRoles,
    stats,
    chartView,
    deptView,
    budgetView,
    selectedBudgetDept,
    selectedBudgetEmpType,
    selectedBudgetExp,
  });

  // Upcoming Interviews List (no fallbacks to dummy data)
  const upcomingList = (interviews || []).filter((i) => i.status === "Scheduled").slice(0, 3);
  const sampleUpcoming = upcomingList;

  const kpiCols = isMobile ? "repeat(2,1fr)" : isTablet ? "repeat(3,1fr)" : "repeat(6,1fr)";
  const twoCol = isMobile ? "1fr" : "1fr 1fr";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── 1. SECTION TITLE WITH EXPORT MENU ─────────────────────────────── */}
      <SectionTitle
        title="Recruitment Dashboard"
        sub="South Point School — June 2026"
        action={
          <div style={{ position: "relative" }}>
            <Btn
              label="Export ▼"
              variant="outline"
              small
              onClick={() => setShowExportMenu(!showExportMenu)}
            />

            {showExportMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 6px)",
                  background: "#ffffff",
                  borderRadius: radius.md,
                  boxShadow: shadow.xl,
                  border: `1px solid ${T.border}`,
                  padding: "6px",
                  zIndex: 100,
                  minWidth: 160,
                }}
              >
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    exportToPDF();
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: radius.sm,
                    fontSize: font.base,
                    fontWeight: font.semibold,
                    color: T.ink,
                    cursor: "pointer",
                  }}
                >
                  📄 Export as PDF
                </button>
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    exportToCSV();
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: radius.sm,
                    fontSize: font.base,
                    fontWeight: font.semibold,
                    color: T.ink,
                    cursor: "pointer",
                  }}
                >
                  📊 Export to Excel
                </button>
              </div>
            )}
          </div>
        }
      />


      {/* ── 2. PRIMARY KPI CARDS GRID ────────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: font.sm, fontWeight: font.extrabold, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Core Recruitment Metrics
          </div>
          <div style={{ fontSize: font.xs, color: T.inkFaint, fontWeight: font.medium }}>
            Click card to view details
          </div>
        </div>

        <div
          style={
            isMobile
              ? {
                  display: "flex",
                  overflowX: "auto",
                  gap: 12,
                  padding: "4px 4px 14px 4px",
                  margin: "0 -16px",
                  paddingLeft: 16,
                  paddingRight: 16,
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }
              : {
                  display: "grid",
                  gridTemplateColumns: kpiCols,
                  gap: 14,
                }
          }
        >
          {kpis.map((k, idx) => (
            <div
              key={k.label}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${idx * 0.05}s`,
                flexShrink: isMobile ? 0 : 1,
                width: isMobile ? "185px" : "auto",
              }}
            >
              <Card
                onClick={() => navigate && navigate(k.nav)}
                style={{
                  padding: isMobile ? 16 : 20,
                  cursor: navigate ? "pointer" : "default",
                  position: "relative",
                  borderTop: `3.5px solid ${k.color}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: radius.lg,
                      background: k.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 19,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    }}
                  >
                    {k.icon}
                  </div>

                  <span
                    style={{
                      fontSize: font.xs,
                      fontWeight: font.bold,
                      background: k.bg,
                      color: k.color,
                      padding: "2px 8px",
                      borderRadius: radius.full,
                      border: `1px solid ${k.color}22`,
                    }}
                  >
                    {k.trend}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: isMobile ? font['2xl'] : font['3xl'],
                    fontWeight: font.black,
                    fontFamily: font.heading,
                    color: T.ink,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {k.value}
                </div>

                <div style={{ fontSize: font.base, fontWeight: font.extrabold, fontFamily: font.body, color: T.ink, marginTop: 8, letterSpacing: "-0.01em" }}>
                  {k.label}
                </div>

                <div style={{ fontSize: font.xs, fontFamily: font.body, color: T.inkFaint, marginTop: 3 }}>
                  {k.sub}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>





      {/* ── 4. CHART.JS INTERACTIVE DASHBOARD GRID (2 COLUMNS) ───────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: twoCol, gap: 16, alignItems: "stretch" }}>

        {/* Col 1: Chart.js Bar + Line Monthly Trends */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.35s", display: "flex", flexDirection: "column" }}>
          <Card style={{ padding: 22, flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: font.base, fontWeight: font.extrabold, color: T.ink, fontFamily: font.heading, letterSpacing: "-0.01em" }}>
                  📊 Monthly Applications & Hires Graph
                </div>
                <div style={{ fontSize: font.xs, color: T.inkFaint, marginTop: 2 }}>
                  Interactive breakdown of monthly applications vs successful hires
                </div>
              </div>

              {/* View Switcher Pills */}
              <div style={{ display: "flex", background: T.canvas, padding: 3, borderRadius: radius.md, border: `1px solid ${T.border}`, gap: 2 }}>
                <button
                  type="button"
                  onClick={() => setChartView("grouped")}
                  title="Show Applications & Hires as side-by-side bar charts"
                  style={{
                    padding: "4px 9px",
                    borderRadius: radius.sm,
                    fontSize: font.xs,
                    fontWeight: font.bold,
                    border: "none",
                    cursor: "pointer",
                    background: chartView === "grouped" ? "#ffffff" : "transparent",
                    color: chartView === "grouped" ? T.primary : T.inkLight,
                    boxShadow: chartView === "grouped" ? shadow.sm : "none",
                    transition: transition.fast,
                  }}
                >
                  📊 Side-by-Side Bars
                </button>

                <button
                  type="button"
                  onClick={() => setChartView("dual")}
                  title="Plot Hires Made on dedicated scaled right axis"
                  style={{
                    padding: "4px 9px",
                    borderRadius: radius.sm,
                    fontSize: font.xs,
                    fontWeight: font.bold,
                    border: "none",
                    cursor: "pointer",
                    background: chartView === "dual" ? "#ffffff" : "transparent",
                    color: chartView === "dual" ? T.primary : T.inkLight,
                    boxShadow: chartView === "dual" ? shadow.sm : "none",
                    transition: transition.fast,
                  }}
                >
                  📈 Dual-Axis (Scaled)
                </button>

                <button
                  type="button"
                  onClick={() => setChartView("hiresOnly")}
                  title="Focus solely on Hires Made monthly bar graph"
                  style={{
                    padding: "4px 9px",
                    borderRadius: radius.sm,
                    fontSize: font.xs,
                    fontWeight: font.bold,
                    border: "none",
                    cursor: "pointer",
                    background: chartView === "hiresOnly" ? "#ffffff" : "transparent",
                    color: chartView === "hiresOnly" ? T.teal : T.inkLight,
                    boxShadow: chartView === "hiresOnly" ? shadow.sm : "none",
                    transition: transition.fast,
                  }}
                >
                  🎯 Hires Focus Graph
                </button>
              </div>
            </div>

            <div style={{ height: 260, position: "relative", marginTop: 8 }}>
              <ChartJSComponent type="bar" data={monthlyChartData} options={monthlyChartOptions} />
            </div>

            {/* Quick Hires Stats Banner */}
            <div
              onClick={() => navigate && navigate("applications")}
              className="card-hover"
              title="Click to view candidate applications"
              style={{
                marginTop: 14,
                padding: "10px 14px",
                background: T.tealLight,
                borderRadius: radius.md,
                border: `1px solid ${T.teal}25`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: font.sm }}>🎉</span>
                <span style={{ fontSize: font.xs + 1, fontWeight: font.bold, color: T.teal }}>
                  Hires Made (YTD): <strong>12 candidates</strong> hired across 6 months
                </span>
              </div>
              <div style={{ fontSize: font.xs, color: T.inkMid, fontWeight: font.medium }}>
                Peak: <strong style={{ color: T.teal }}>4 hires in May</strong> • Avg 2 hires/mo
              </div>
            </div>
          </Card>
        </div>

        {/* Col 2: Chart.js Doughnut Candidate Funnel */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.4s", display: "flex", flexDirection: "column" }}>
          <Card style={{ padding: 22, flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: font.base, fontWeight: font.extrabold, color: T.ink, fontFamily: font.heading, letterSpacing: "-0.01em" }}>
                  🍩 Candidate Funnel Breakdown
                </div>
                <div style={{ fontSize: font.xs, color: T.inkFaint, marginTop: 2 }}>
                  Distribution & conversion of candidates across pipeline stages
                </div>
              </div>

              {/* View Switcher Pills */}
              <div style={{ display: "flex", background: T.canvas, padding: 3, borderRadius: radius.md, border: `1px solid ${T.border}`, gap: 2 }}>
                <button
                  type="button"
                  onClick={() => setFunnelView("doughnut")}
                  title="Doughnut breakdown view"
                  style={{
                    padding: "4px 8px",
                    borderRadius: radius.sm,
                    fontSize: font.xs,
                    fontWeight: font.bold,
                    border: "none",
                    cursor: "pointer",
                    background: funnelView === "doughnut" ? "#ffffff" : "transparent",
                    color: funnelView === "doughnut" ? T.sky : T.inkLight,
                    boxShadow: funnelView === "doughnut" ? shadow.sm : "none",
                    transition: transition.fast,
                  }}
                >
                  🍩 Doughnut
                </button>

                <button
                  type="button"
                  onClick={() => setFunnelView("funnelBars")}
                  title="Horizontal stage progression view"
                  style={{
                    padding: "4px 8px",
                    borderRadius: radius.sm,
                    fontSize: font.xs,
                    fontWeight: font.bold,
                    border: "none",
                    cursor: "pointer",
                    background: funnelView === "funnelBars" ? "#ffffff" : "transparent",
                    color: funnelView === "funnelBars" ? T.violet : T.inkLight,
                    boxShadow: funnelView === "funnelBars" ? shadow.sm : "none",
                    transition: transition.fast,
                  }}
                >
                  🔻 Stage Funnel
                </button>
              </div>
            </div>

            {funnelView === "doughnut" ? (
              <div style={{ height: 240, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Doughnut data={funnelDoughnutData} options={funnelDoughnutOptions} plugins={[centerTextPlugin]} />
              </div>
            ) : (
              /* Funnel Stage Horizontal Progression Bars */
              <div style={{ height: 240, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
                {funnelStages.map((stage) => {
                  const pct = Math.round((stage.count / totalAppsCount) * 100);
                  return (
                    <div key={stage.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: font.xs + 1, fontWeight: font.bold, color: T.ink, marginBottom: 4 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color }} />
                          {stage.label}
                        </span>
                        <span style={{ color: stage.color }}>
                          {stage.count} <span style={{ fontSize: font.xs, color: T.inkFaint, fontWeight: font.medium }}>({pct}%)</span>
                        </span>
                      </div>
                      <div style={{ background: T.canvas, borderRadius: radius.full, height: 10, overflow: "hidden", border: `1px solid ${T.border}` }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: stage.color,
                            borderRadius: radius.full,
                            transition: transition.medium,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Candidate Funnel Conversion Metrics Grid */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginTop: 14 }}>
              {/* Card 1: Shortlist Efficiency */}
              <div
                onClick={() => navigate && navigate("applications")}
                className="card-hover"
                title="Click to view candidate applications"
                style={{
                  background: T.skyLight,
                  borderRadius: radius.md,
                  padding: "10px 12px",
                  border: `1px solid ${T.sky}35`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: font.xs, fontWeight: font.extrabold, color: T.sky, textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 4 }}>
                    🎯 Shortlist Efficiency
                  </span>
                  <span style={{ fontSize: font.base, fontWeight: font.black, fontFamily: font.heading, color: T.sky }}>
                    {Math.round((shortlistedCount / totalAppsCount) * 100)}%
                  </span>
                </div>

                <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: radius.full, height: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.round((shortlistedCount / totalAppsCount) * 100)}%`,
                      height: "100%",
                      background: T.sky,
                      borderRadius: radius.full,
                    }}
                  />
                </div>

                <div style={{ fontSize: font.xs, color: T.inkMid, fontWeight: font.medium }}>
                  {shortlistedCount} of {totalAppsCount} candidates shortlisted
                </div>
              </div>

              {/* Card 2: Offer Conversion Rate */}
              <div
                onClick={() => navigate && navigate("offer-management")}
                className="card-hover"
                title="Click to view offer management"
                style={{
                  background: T.greenLight,
                  borderRadius: radius.md,
                  padding: "10px 12px",
                  border: `1px solid ${T.green}35`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: font.xs, fontWeight: font.extrabold, color: T.green, textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 4 }}>
                    📨 Offer Conversion
                  </span>
                  <span style={{ fontSize: font.base, fontWeight: font.black, fontFamily: font.heading, color: T.green }}>
                    {Math.round((safeOffersCount / totalAppsCount) * 100)}%
                  </span>
                </div>

                <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: radius.full, height: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.round((safeOffersCount / totalAppsCount) * 100)}%`,
                      height: "100%",
                      background: T.green,
                      borderRadius: radius.full,
                    }}
                  />
                </div>

                <div style={{ fontSize: font.xs, color: T.inkMid, fontWeight: font.medium }}>
                  {safeOffersCount} of {totalAppsCount} candidates offered
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Col 1, Row 2: Chart.js Department Positions Bar Chart */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.45s", display: "flex", flexDirection: "column" }}>
          <Card style={{ padding: 22, flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: font.base, fontWeight: font.extrabold, color: T.ink, fontFamily: font.heading, letterSpacing: "-0.01em" }}>
                  🎯 Department Headcount Progress
                </div>
                <div style={{ fontSize: font.xs, color: T.inkFaint, marginTop: 2 }}>
                  Filled vs open headcount quota per academic department
                </div>
              </div>

              {/* View Switcher Pills */}
              <div style={{ display: "flex", background: T.canvas, padding: 3, borderRadius: radius.md, border: `1px solid ${T.border}`, gap: 2 }}>
                <button
                  type="button"
                  onClick={() => setDeptView("stacked")}
                  title="Show filled vs open stacked by quota"
                  style={{
                    padding: "4px 8px",
                    borderRadius: radius.sm,
                    fontSize: font.xs,
                    fontWeight: font.bold,
                    border: "none",
                    cursor: "pointer",
                    background: deptView === "stacked" ? "#ffffff" : "transparent",
                    color: deptView === "stacked" ? T.primary : T.inkLight,
                    boxShadow: deptView === "stacked" ? shadow.sm : "none",
                    transition: transition.fast,
                  }}
                >
                  📊 Stacked Quota
                </button>

                <button
                  type="button"
                  onClick={() => setDeptView("grouped")}
                  title="Show filled vs open side by side"
                  style={{
                    padding: "4px 8px",
                    borderRadius: radius.sm,
                    fontSize: font.xs,
                    fontWeight: font.bold,
                    border: "none",
                    cursor: "pointer",
                    background: deptView === "grouped" ? "#ffffff" : "transparent",
                    color: deptView === "grouped" ? T.primary : T.inkLight,
                    boxShadow: deptView === "grouped" ? shadow.sm : "none",
                    transition: transition.fast,
                  }}
                >
                  📶 Side-by-Side
                </button>

                <button
                  type="button"
                  onClick={() => setDeptView("fillRate")}
                  title="Show percentage filled per department"
                  style={{
                    padding: "4px 8px",
                    borderRadius: radius.sm,
                    fontSize: font.xs,
                    fontWeight: font.bold,
                    border: "none",
                    cursor: "pointer",
                    background: deptView === "fillRate" ? "#ffffff" : "transparent",
                    color: deptView === "fillRate" ? T.green : T.inkLight,
                    boxShadow: deptView === "fillRate" ? shadow.sm : "none",
                    transition: transition.fast,
                  }}
                >
                  ⚡ Fill Rate %
                </button>
              </div>
            </div>

            <div style={{ height: 240, position: "relative" }}>
              <Bar data={deptChartData} options={deptChartOptions} />
            </div>

            {/* Department Overall Headcount Summary Banner */}
            <div
              onClick={() => navigate && navigate("job-postings")}
              className="card-hover"
              title="Click to view department job postings"
              style={{
                marginTop: 14,
                padding: "10px 14px",
                background: T.greenLight,
                borderRadius: radius.md,
                border: `1px solid ${T.green}25`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: font.sm }}>📋</span>
                <span style={{ fontSize: font.xs + 1, fontWeight: font.bold, color: T.green }}>
                  Overall Headcount: <strong>5 of 16 positions filled</strong> (31.2% complete)
                </span>
              </div>
              <div style={{ fontSize: font.xs, color: T.inkMid, fontWeight: font.medium }}>
                Leading: <strong style={{ color: T.green }}>Arts & Sports (50% filled)</strong>
              </div>
            </div>
          </Card>
        </div>

        {/* Col 2, Row 2: Upcoming Interviews & Schedule */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.5s", display: "flex", flexDirection: "column" }}>
          <Card style={{ padding: 22, flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: font.base, fontWeight: font.extrabold, color: T.ink, fontFamily: font.heading, letterSpacing: "-0.01em" }}>
                📅 Upcoming Interview Schedule
              </div>
              {navigate && (
                <button
                  onClick={() => navigate("interview-panel")}
                  style={{
                    background: "none",
                    border: "none",
                    color: T.primary,
                    fontSize: font.xs + 1,
                    fontWeight: font.extrabold,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  View All →
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {sampleUpcoming.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "40px 20px", color: T.inkFaint, textAlign: "center" }}>
                  <span style={{ fontSize: 32, marginBottom: 8 }}>🗓️</span>
                  <div style={{ fontSize: font.sm, fontWeight: font.bold, color: T.inkMid }}>No Upcoming Interviews</div>
                  <div style={{ fontSize: font.xs, marginTop: 4 }}>All scheduled interviews have been conducted.</div>
                </div>
              ) : (
                sampleUpcoming.map((u, i) => (
                <div
                  key={u.id || i}
                  onClick={() => navigate && navigate("interview-panel")}
                  className="row-hover"
                  title="Click to view in interview panel"
                  style={{
                    background: T.canvas,
                    borderRadius: radius.lg,
                    padding: "14px 16px",
                    border: `1px solid ${T.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 10,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: T.primaryLight,
                        color: T.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: font.extrabold,
                        fontSize: font.sm + 1,
                        border: `1px solid ${T.primary}25`,
                        flexShrink: 0,
                      }}
                    >
                      {u.candidate ? u.candidate.charAt(0).toUpperCase() : "C"}
                    </div>
                    <div>
                      <div style={{ fontSize: font.base, fontWeight: font.bold, color: T.ink }}>
                        {u.candidate}
                      </div>
                      <div style={{ fontSize: font.xs + 1, color: T.inkLight, marginTop: 1 }}>
                        {u.role}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: font.xs + 1, fontWeight: font.extrabold, color: T.primary }}>
                        {u.date}
                      </div>
                      <div style={{ fontSize: font.xs, color: T.inkFaint, marginTop: 1 }}>
                        {u.time}
                      </div>
                    </div>

                    {navigate && (
                      <Btn
                        label="Panel"
                        variant="outline"
                        small
                        onClick={() => navigate("interview-panel")}
                      />
                    )}
                  </div>
                </div>
              ))
              )}
            </div>
          </Card>
        </div>

      </div>


      {/* ── 5. ROLE-WISE DEPARTMENT RECRUITMENT BUDGET & COST ANALYTICS ────── */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.52s" }}>
        <Card style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: font.base, fontWeight: font.extrabold, color: T.ink, fontFamily: font.heading, letterSpacing: "-0.01em" }}>
                💰 Role Recruitment Budget Analytics
              </div>
              <div style={{ fontSize: font.xs, color: T.inkFaint, marginTop: 2 }}>
                Financial breakdown of allocated hiring budget vs actual cost by role, department & employment type
              </div>
            </div>

            {/* View Switcher Pills */}
            <div style={{ display: "flex", background: T.canvas, padding: 3, borderRadius: radius.md, border: `1px solid ${T.border}`, gap: 2, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setBudgetView("roleAllocation")}
                title="Show allocated budget vs actual spend per role"
                style={{
                  padding: "4px 9px",
                  borderRadius: radius.sm,
                  fontSize: font.xs,
                  fontWeight: font.bold,
                  border: "none",
                  cursor: "pointer",
                  background: budgetView === "roleAllocation" ? "#ffffff" : "transparent",
                  color: budgetView === "roleAllocation" ? T.teal : T.inkLight,
                  boxShadow: budgetView === "roleAllocation" ? shadow.sm : "none",
                  transition: transition.fast,
                }}
              >
                🎭 Role Breakdown
              </button>

              <button
                type="button"
                onClick={() => setBudgetView("empTypeBreakdown")}
                title="Group budget by employment type"
                style={{
                  padding: "4px 9px",
                  borderRadius: radius.sm,
                  fontSize: font.xs,
                  fontWeight: font.bold,
                  border: "none",
                  cursor: "pointer",
                  background: budgetView === "empTypeBreakdown" ? "#ffffff" : "transparent",
                  color: budgetView === "empTypeBreakdown" ? T.teal : T.inkLight,
                  boxShadow: budgetView === "empTypeBreakdown" ? shadow.sm : "none",
                  transition: transition.fast,
                }}
              >
                💼 By Type
              </button>

              <button
                type="button"
                onClick={() => setBudgetView("deptSummary")}
                title="Show high-level department budget totals"
                style={{
                  padding: "4px 9px",
                  borderRadius: radius.sm,
                  fontSize: font.xs,
                  fontWeight: font.bold,
                  border: "none",
                  cursor: "pointer",
                  background: budgetView === "deptSummary" ? "#ffffff" : "transparent",
                  color: budgetView === "deptSummary" ? T.accentDark : T.inkLight,
                  boxShadow: budgetView === "deptSummary" ? shadow.sm : "none",
                  transition: transition.fast,
                }}
              >
                🏛️ Dept Totals
              </button>
            </div>
          </div>

          {/* Filter Controls Bar */}
          {budgetView !== "deptSummary" && budgetView !== "empTypeBreakdown" && (
            <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap", alignItems: "center", background: T.canvas, padding: "8px 12px", borderRadius: radius.md, border: `1px solid ${T.border}` }}>
              {/* Department Filter */}
              <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: font.xs, fontWeight: font.bold, color: T.inkFaint }}>Dept:</span>
                {availableDepts.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedBudgetDept(dept)}
                    style={{
                      padding: "2px 9px",
                      borderRadius: radius.full,
                      fontSize: font.xs,
                      fontWeight: font.bold,
                      border: selectedBudgetDept === dept ? `1.5px solid ${T.primary}` : `1px solid ${T.border}`,
                      background: selectedBudgetDept === dept ? T.primaryLight : "#ffffff",
                      color: selectedBudgetDept === dept ? T.primary : T.inkMid,
                      cursor: "pointer",
                      transition: transition.fast,
                    }}
                  >
                    {dept === "all" ? "All" : dept}
                  </button>
                ))}
              </div>

              <div style={{ width: 1, height: 16, background: T.border }} />

              {/* Employee Type Filter */}
              <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: font.xs, fontWeight: font.bold, color: T.inkFaint }}>Type:</span>
                {availableEmpTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedBudgetEmpType(type)}
                    style={{
                      padding: "2px 9px",
                      borderRadius: radius.full,
                      fontSize: font.xs,
                      fontWeight: font.bold,
                      border: selectedBudgetEmpType === type ? `1.5px solid ${T.teal}` : `1px solid ${T.border}`,
                      background: selectedBudgetEmpType === type ? T.tealLight : "#ffffff",
                      color: selectedBudgetEmpType === type ? T.teal : T.inkMid,
                      cursor: "pointer",
                      transition: transition.fast,
                    }}
                  >
                    {type === "all" ? "All Types" : type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Graph Container */}
          <div style={{ height: 350, position: "relative" }}>
            <Bar data={budgetChartData} options={budgetChartOptions} />
          </div>

          {/* Role-Level Detailed Budget Table */}
          <div style={{ marginTop: 18, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: font.xs, fontWeight: font.extrabold, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                📋 Detailed Role Hiring Budget & Requirement Breakdown ({filteredRoleBudgetData.length} roles)
              </div>
              <div style={{ fontSize: font.xs, color: T.inkFaint, fontWeight: font.medium }}>
                Derived from Sanctioned Positions Registry
              </div>
            </div>

            <div style={{ overflowX: "auto", borderRadius: radius.lg, border: `1px solid ${T.border}`, boxShadow: shadow.sm }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: font.xs + 1 }}>
                <thead>
                  <tr style={{ background: T.canvas, borderBottom: `1px solid ${T.border}` }}>
                    <th style={{ textAlign: "left", padding: "11px 14px", color: T.inkMid, fontWeight: font.bold, width: "24%", borderTopLeftRadius: radius.lg }}>Job Role Title</th>
                    <th style={{ textAlign: "left", padding: "11px 8px", color: T.inkMid, fontWeight: font.bold, width: "11%" }}>Dept</th>
                    <th style={{ textAlign: "left", padding: "11px 8px", color: T.inkMid, fontWeight: font.bold, width: "11%" }}>Type</th>
                    <th style={{ textAlign: "center", padding: "11px 8px", color: T.inkMid, fontWeight: font.bold, width: "12%" }}>Required Exp</th>
                    <th style={{ textAlign: "center", padding: "11px 8px", color: T.inkMid, fontWeight: font.bold, width: "10%" }}>Target Hires</th>
                    <th style={{ textAlign: "right", padding: "11px 8px", color: T.inkMid, fontWeight: font.bold, width: "15%" }}>Allocated Budget</th>
                    <th style={{ textAlign: "right", padding: "11px 8px", color: T.inkMid, fontWeight: font.bold, width: "12%" }}>Actual Spend</th>
                    <th style={{ textAlign: "center", padding: "11px 8px 11px 40px", color: T.inkMid, fontWeight: font.bold, width: "16%", borderTopRightRadius: radius.lg }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoleBudgetData.map((item, idx) => {
                    const isFT = item.type === "Full-time";
                    const isPT = item.type === "Part-time";
                    const badgeBg = isFT ? T.tealLight : isPT ? "#EDE9FE" : T.accentLight;
                    const badgeColor = isFT ? T.teal : isPT ? "#7C3AED" : T.accentDark;

                    return (
                      <tr
                        key={item.id || item.role || idx}
                        onClick={() => navigate && navigate("existing-roles")}
                        className="row-hover"
                        title="Click to view role details in Existing Roles"
                        style={{
                          borderBottom: `1px solid ${T.border}60`,
                          background: idx % 2 === 0 ? "#ffffff" : T.canvas + "60",
                          cursor: "pointer",
                        }}
                      >
                        <td style={{ padding: "10px 14px", fontWeight: font.bold, color: T.ink }}>
                          <div>{item.role}</div>
                          <div style={{ fontSize: font.xs - 1, color: T.inkFaint, fontWeight: font.medium, marginTop: 1 }}>{item.id} • {item.category}</div>
                        </td>
                        <td style={{ padding: "10px 8px", color: T.inkLight }}>
                          <span style={{ background: T.canvas, padding: "2px 8px", borderRadius: radius.md, fontSize: font.xs - 1, border: `1px solid ${T.border}`, fontWeight: font.bold }}>
                            {item.dept}
                          </span>
                        </td>
                        <td style={{ padding: "10px 8px", color: T.inkLight }}>
                          <span style={{
                            background: badgeBg,
                            color: badgeColor,
                            padding: "2px 9px",
                            borderRadius: radius.md,
                            fontSize: font.xs - 1,
                            fontWeight: font.bold,
                            whiteSpace: "nowrap",
                          }}>
                            {item.type}
                          </span>
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 8px", fontWeight: font.bold, color: T.inkMid }}>
                          {item.experience}
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 8px", fontWeight: font.bold, color: T.teal }}>
                          {item.filled} / {item.targetHires}
                        </td>
                        <td style={{ textAlign: "right", padding: "10px 8px", fontWeight: font.extrabold, color: T.primary }}>
                          ₹{item.allocated.toLocaleString("en-IN")}
                        </td>
                        <td style={{ textAlign: "right", padding: "10px 8px", fontWeight: font.extrabold, color: T.teal }}>
                          ₹{item.spent.toLocaleString("en-IN")}
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 8px 10px 40px" }}>
                          <span style={{ fontSize: 10, fontWeight: font.bold, color: T.green, background: T.greenLight, padding: "2px 8px", borderRadius: radius.full, border: `1px solid ${T.green}30`, whiteSpace: "nowrap", display: "inline-block" }}>
                            Under Budget
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: T.canvas,
                      borderTop: `2px solid ${T.primary}30`,
                      fontSize: font.xs + 1,
                    }}
                  >
                    <td style={{ padding: "13px 14px", fontWeight: font.black, color: T.primary, fontFamily: font.heading, borderBottomLeftRadius: radius.lg }}>
                      Total ({filteredRoleBudgetData.length} Roles)
                    </td>
                    <td style={{ padding: "13px 8px" }} />
                    <td style={{ padding: "13px 8px" }} />
                    <td style={{ padding: "13px 8px" }} />
                    <td style={{ textAlign: "center", padding: "13px 8px", fontWeight: font.black, color: T.teal }}>
                      {totalFilledHires} / {totalTargetHires}
                    </td>
                    <td style={{ textAlign: "right", padding: "13px 8px", fontWeight: font.black, color: T.primary, fontSize: font.base }}>
                      ₹{totalAllocatedBudget.toLocaleString("en-IN")}
                    </td>
                    <td style={{ textAlign: "right", padding: "13px 8px", fontWeight: font.black, color: T.teal, fontSize: font.base }}>
                      ₹{totalActualSpend.toLocaleString("en-IN")}
                    </td>
                    <td style={{ textAlign: "center", padding: "13px 8px 13px 40px", borderBottomRightRadius: radius.lg }}>
                      <span style={{ fontSize: 10, fontWeight: font.bold, color: T.green, background: T.greenLight, padding: "3px 10px", borderRadius: radius.full, border: `1px solid ${T.green}40`, whiteSpace: "nowrap", display: "inline-block", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                        ₹{(totalAllocatedBudget - totalActualSpend).toLocaleString("en-IN")} Surplus
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </Card>
      </div>


      {/* ── 6. LIVE RECENT ACTIVITY LOG ────────────────────────────────────── */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.55s" }}>
        <Card style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: radius.md,
                background: T.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: T.primary
              }}>
                ⚡
              </div>
              <div>
                <div style={{ fontSize: font.base, fontWeight: font.extrabold, color: T.ink, fontFamily: font.heading, letterSpacing: "-0.01em" }}>
                  Recent Recruitment Activity Log
                </div>
                <div style={{ fontSize: font.xs, color: T.inkFaint, marginTop: 1 }}>
                  Real-time audit feed of system actions, applications & offer approvals
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.greenLight, color: T.green, padding: "3px 10px", borderRadius: radius.full, fontSize: font.xs, fontWeight: font.bold, border: `1px solid ${T.green}30` }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, boxShadow: `0 0 0 3px ${T.green}30` }} />
                Recent 6 Hours
              </span>

              <button
                type="button"
                onClick={() => setShowAllActivityModal(true)}
                style={{
                  background: T.primary,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: radius.md,
                  padding: "5px 12px",
                  fontSize: font.xs,
                  fontWeight: font.bold,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: shadow.sm,
                  transition: transition.fast,
                }}
              >
                👁️ View All Activity ({allActivity ? allActivity.length : 0})
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activity.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", color: T.inkFaint, textAlign: "center" }}>
                <span style={{ fontSize: 32, marginBottom: 8 }}>⚡</span>
                <div style={{ fontSize: font.sm, fontWeight: font.bold, color: T.inkMid }}>No Recent Activity (Last 6 Hours)</div>
                <div style={{ fontSize: font.xs, marginTop: 4 }}>System actions and audits from the last 6 hours will appear here.</div>
                {allActivity && allActivity.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllActivityModal(true)}
                    style={{
                      marginTop: 12,
                      background: T.primary,
                      color: "#ffffff",
                      border: "none",
                      borderRadius: radius.md,
                      padding: "6px 14px",
                      fontSize: font.xs,
                      fontWeight: font.bold,
                      cursor: "pointer",
                    }}
                  >
                    View All {allActivity.length} System Activities →
                  </button>
                )}
              </div>
            ) : (
              activity.map((a, i) => {
              const navTarget =
                a.type === "Offer" ? "offer-management" :
                a.type === "Application" ? "applications" :
                a.type === "Approval" ? "approval-requests" :
                a.type === "Interview" ? "interview-panel" : "dashboard";

              return (
                <div
                  key={i}
                  onClick={() => navigate && navigate(navTarget)}
                  className="card-hover"
                  title={`Click to view ${a.type.toLowerCase()} details`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 16px",
                    borderRadius: radius.md,
                    background: i % 2 === 0 ? "#FAFAFA" : "#ffffff",
                    border: `1px solid ${T.border}70`,
                    transition: transition.fast,
                    boxShadow: shadow.sm,
                    cursor: "pointer",
                  }}
                >
                {/* Type Icon Badge Avatar */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: radius.md,
                    background: a.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 17,
                    flexShrink: 0,
                    border: `1px solid ${a.dot}30`,
                  }}
                >
                  {a.icon}
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                    <span style={{
                      fontFamily: "monospace",
                      fontSize: font.xs - 1,
                      fontWeight: font.extrabold,
                      background: T.canvas,
                      color: T.ink,
                      padding: "1px 6px",
                      borderRadius: radius.sm,
                      border: `1px solid ${T.border}`,
                    }}>
                      {a.id}
                    </span>
                    <span style={{ fontSize: font.xs + 1, fontWeight: font.extrabold, color: T.ink }}>
                      {a.title}
                    </span>
                  </div>
                  <div style={{ fontSize: font.xs + 1, color: T.inkMid, whiteSpace: "normal", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {a.detail}
                  </div>
                </div>

                {/* Status Badge & Timestamp */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: font.xs - 1,
                      fontWeight: font.bold,
                      background: a.bg,
                      color: a.dot,
                      padding: "2px 9px",
                      borderRadius: radius.full,
                      border: `1px solid ${a.dot}30`,
                    }}
                  >
                    {a.type}
                  </span>
                  <span style={{ fontSize: font.xs - 1, color: T.inkFaint, fontWeight: font.medium }}>
                    🕒 {a.time}
                  </span>
                </div>
              </div>
            );
          }))}
          </div>

          {allActivity && allActivity.length > activity.length && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 14, paddingTop: 10, borderTop: `1px dashed ${T.border}` }}>
              <button
                type="button"
                onClick={() => setShowAllActivityModal(true)}
                style={{
                  background: T.canvas,
                  color: T.primary,
                  border: `1px solid ${T.primary}40`,
                  borderRadius: radius.md,
                  padding: "7px 18px",
                  fontSize: font.xs,
                  fontWeight: font.bold,
                  cursor: "pointer",
                  transition: transition.fast,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Show All {allActivity.length} System Activities →
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* ── ALL ACTIVITY LOG MODAL ─────────────────────────────────────── */}
      {showAllActivityModal && createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setShowAllActivityModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: radius.lg,
              width: "100%",
              maxWidth: 760,
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: shadow.xl,
              border: `1px solid ${T.border}`,
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: "18px 22px", background: T.canvas, borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: font.base + 2, fontWeight: font.extrabold, color: T.ink, fontFamily: font.heading, display: "flex", alignItems: "center", gap: 8 }}>
                  ⚡ System Recruitment Activity Log
                </div>
                <div style={{ fontSize: font.xs, color: T.inkFaint, marginTop: 2 }}>
                  Complete audit trail of system actions, applications, interviews & offer approvals
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllActivityModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 22,
                  cursor: "pointer",
                  color: T.inkLight,
                  padding: 4,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Filter Controls */}
            <div style={{ padding: "12px 22px", borderBottom: `1px solid ${T.border}`, background: "#ffffff", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Search activity by name, ID, or title..."
                value={activityModalSearch}
                onChange={(e) => setActivityModalSearch(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 200,
                  padding: "7px 12px",
                  borderRadius: radius.md,
                  border: `1px solid ${T.border}`,
                  fontSize: font.xs,
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {["All", "Application", "Interview", "Offer", "Approval"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActivityModalFilter(t)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: radius.full,
                      fontSize: font.xs,
                      fontWeight: font.bold,
                      border: activityModalFilter === t ? `1.5px solid ${T.primary}` : `1px solid ${T.border}`,
                      background: activityModalFilter === t ? T.primaryLight : "transparent",
                      color: activityModalFilter === t ? T.primary : T.inkMid,
                      cursor: "pointer",
                      transition: transition.fast,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body List */}
            <div style={{ flex: 1, overflowY: "auto", padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
              {(() => {
                const filtered = (allActivity || []).filter((a) => {
                  const matchesFilter = activityModalFilter === "All" || a.type === activityModalFilter;
                  const q = activityModalSearch.toLowerCase();
                  const matchesSearch = !q || (a.id && a.id.toLowerCase().includes(q)) || (a.title && a.title.toLowerCase().includes(q)) || (a.detail && a.detail.toLowerCase().includes(q));
                  return matchesFilter && matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div style={{ padding: 40, textAlign: "center", color: T.inkFaint }}>
                      No activity logs match your filter criteria.
                    </div>
                  );
                }

                return filtered.map((a, i) => {
                  const navTarget =
                    a.type === "Offer" ? "offer-management" :
                    a.type === "Application" ? "applications" :
                    a.type === "Approval" ? "approval-requests" :
                    a.type === "Interview" ? "interview-panel" : "dashboard";

                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setShowAllActivityModal(false);
                        if (navigate) navigate(navTarget);
                      }}
                      className="card-hover"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "12px 16px",
                        borderRadius: radius.md,
                        background: "#FAFAFA",
                        border: `1px solid ${T.border}70`,
                        cursor: "pointer",
                        boxShadow: shadow.sm,
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: radius.md,
                          background: a.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 17,
                          flexShrink: 0,
                          border: `1px solid ${a.dot}30`,
                        }}
                      >
                        {a.icon}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                          <span style={{
                            fontFamily: "monospace",
                            fontSize: font.xs - 1,
                            fontWeight: font.extrabold,
                            background: T.canvas,
                            color: T.ink,
                            padding: "1px 6px",
                            borderRadius: radius.sm,
                            border: `1px solid ${T.border}`,
                          }}>
                            {a.id}
                          </span>
                          <span style={{ fontSize: font.xs + 1, fontWeight: font.extrabold, color: T.ink }}>
                            {a.title}
                          </span>
                        </div>
                        <div style={{ fontSize: font.xs + 1, color: T.inkMid }}>
                          {a.detail}
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                        <span
                          style={{
                            fontSize: font.xs - 1,
                            fontWeight: font.bold,
                            background: a.bg,
                            color: a.dot,
                            padding: "2px 9px",
                            borderRadius: radius.full,
                            border: `1px solid ${a.dot}30`,
                          }}
                        >
                          {a.type}
                        </span>
                        <span style={{ fontSize: font.xs - 1, color: T.inkFaint, fontWeight: font.medium }}>
                          🕒 {a.time}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "12px 22px", background: T.canvas, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: font.xs, color: T.inkFaint }}>
                Total system audit logs: <strong>{allActivity ? allActivity.length : 0}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowAllActivityModal(false)}
                style={{
                  padding: "6px 16px",
                  borderRadius: radius.md,
                  border: `1px solid ${T.border}`,
                  background: "#ffffff",
                  fontSize: font.xs,
                  fontWeight: font.bold,
                  color: T.inkMid,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

// Chart.js helper component for mixed Bar/Line charts
function ChartJSComponent({ type, data, options }) {
  if (type === "bar") {
    return <Bar data={data} options={options} />;
  }
  return <Line data={data} options={options} />;
}
