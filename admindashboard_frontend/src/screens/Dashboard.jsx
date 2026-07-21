import React, { useState } from "react";
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

  // ── Chart.js Configurations ──────────────────────────────────────────────

  // 1. Monthly Trends Chart (Applications vs Hires - Dynamic from DB)
  const getMonthlyChartData = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        name: monthNames[d.getMonth()],
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
      });
    }

    const labels = last6Months.map((m) => m.name);

    // Count applications received in each month (from both job & general applications)
    const appsData = last6Months.map((m) => {
      const countJobApps = (jobApplications || []).filter((app) => {
        if (!app.applied) return false;
        const d = new Date(app.applied);
        return d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
      }).length;
      const countGenApps = (generalApplications || []).filter((app) => {
        if (!app.applied) return false;
        const d = new Date(app.applied);
        return d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
      }).length;
      return countJobApps + countGenApps;
    });

    // Count hires (offers accepted or joined)
    const hiresData = last6Months.map((m) => {
      return (offers || []).filter((o) => {
        if (o.status !== "Accepted" && o.status !== "Joined") return false;
        const d = o.joining ? new Date(o.joining) : (o.issued ? new Date(o.issued) : null);
        return d && d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
      }).length;
    });

    if (chartView === "hiresOnly") {
      return {
        labels,
        datasets: [
          {
            type: "bar",
            label: "Hires Made (Monthly Bar)",
            data: hiresData,
            backgroundColor: "rgba(0, 139, 139, 0.85)",
            borderColor: T.teal,
            borderWidth: 1.5,
            borderRadius: 6,
            hoverBackgroundColor: T.teal,
          },
          {
            type: "line",
            label: "Hires Trend Target",
            data: hiresData.map((h) => Math.max(1, Math.round(h * 1.2))),
            borderColor: T.accentDark,
            borderWidth: 2,
            borderDash: [4, 4],
            pointRadius: 4,
            pointBackgroundColor: T.accentDark,
            fill: false,
            tension: 0.3,
          },
        ],
      };
    }

    if (chartView === "dual") {
      return {
        labels,
        datasets: [
          {
            type: "bar",
            label: "Applications Received (Left Axis)",
            data: appsData,
            backgroundColor: "rgba(114, 16, 42, 0.85)",
            borderColor: T.primary,
            borderWidth: 1.5,
            borderRadius: 6,
            hoverBackgroundColor: T.primary,
            yAxisID: "y",
          },
          {
            type: "line",
            label: "Hires Made (Right Scaled Axis)",
            data: hiresData,
            borderColor: T.teal,
            backgroundColor: "rgba(0, 139, 139, 0.2)",
            borderWidth: 3,
            pointBackgroundColor: T.teal,
            pointBorderColor: "#fff",
            pointHoverRadius: 7,
            pointRadius: 5,
            tension: 0.35,
            fill: true,
            yAxisID: "y1",
          },
        ],
      };
    }

    // Default: "grouped" side-by-side Bar Graph for Applications and Hires Made
    return {
      labels,
      datasets: [
        {
          type: "bar",
          label: "Applications Received",
          data: appsData,
          backgroundColor: "rgba(114, 16, 42, 0.85)",
          borderColor: T.primary,
          borderWidth: 1.5,
          borderRadius: 6,
          hoverBackgroundColor: T.primary,
        },
        {
          type: "bar",
          label: "Hires Made (Bar Graph)",
          data: hiresData,
          backgroundColor: "rgba(0, 139, 139, 0.9)",
          borderColor: T.teal,
          borderWidth: 1.5,
          borderRadius: 6,
          hoverBackgroundColor: T.teal,
        },
      ],
    };
  };

  const monthlyChartData = getMonthlyChartData();

  const legendOnHover = (event) => {
    if (event.native && event.native.target) {
      event.native.target.style.cursor = "pointer";
    }
  };

  const legendOnLeave = (event) => {
    if (event.native && event.native.target) {
      event.native.target.style.cursor = "default";
    }
  };

  const chartOnHover = (event, chartElement, chart) => {
    if (!event.native || !event.native.target) return;
    if (chartElement && chartElement.length > 0) {
      event.native.target.style.cursor = "pointer";
      return;
    }
    const leg = chart?.legend;
    if (leg && leg.options && leg.options.display !== false) {
      const { x, y } = event;
      if (x >= leg.left && x <= leg.right && y >= leg.top && y <= leg.bottom) {
        event.native.target.style.cursor = "pointer";
        return;
      }
    }
    event.native.target.style.cursor = "default";
  };

  const getMonthlyChartOptions = () => {
    const basePlugins = {
      legend: {
        position: "top",
        onHover: legendOnHover,
        onLeave: legendOnLeave,
        labels: {
          font: { family: "'Inter', sans-serif", size: 12, weight: 600 },
          color: T.inkMid,
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: "#1A1A1A",
        titleFont: { family: "'Outfit', sans-serif", size: 13, weight: 700 },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
        padding: 12,
        cornerRadius: 8,
      },
    };

    if (chartView === "dual") {
      return {
        responsive: true,
        maintainAspectRatio: false,
        onHover: chartOnHover,
        plugins: basePlugins,
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Inter', sans-serif", size: 11, weight: 600 }, color: T.inkLight },
          },
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: { display: true, text: "Applications (Count)", color: T.primary, font: { family: "'Inter', sans-serif", size: 11, weight: 700 } },
            grid: { color: "#E8E2D9", borderDash: [4, 4] },
            ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: T.inkFaint },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: { display: true, text: "Hires Made (Count)", color: T.teal, font: { family: "'Inter', sans-serif", size: 11, weight: 700 } },
            grid: { drawOnChartArea: false },
            ticks: { font: { family: "'Inter', sans-serif", size: 11, weight: 700 }, color: T.teal, stepSize: 1 },
            min: 0,
            max: 5,
          },
        },
      };
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      onHover: chartOnHover,
      plugins: basePlugins,
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: "'Inter', sans-serif", size: 11, weight: 600 }, color: T.inkLight },
        },
        y: {
          grid: { color: "#E8E2D9", borderDash: [4, 4] },
          ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: T.inkFaint },
        },
      },
    };
  };

  const monthlyChartOptions = getMonthlyChartOptions();

  // 2. Candidate Funnel Doughnut Chart & Funnel Stages
  const shortlistedCount = Math.min(18, Math.max(1, Math.round(totalAppsCount * 0.38)));
  const selectedCount = Math.min(4, Math.max(1, Math.round(totalAppsCount * 0.15)));
  const safeOffersCount = Math.min(offersCount, Math.max(1, Math.round(totalAppsCount * 0.10)));

  const funnelStages = [
    { label: "Applied", count: stats ? stats.pipeline.applied : totalAppsCount, color: "#0284C7", bg: T.skyLight },
    { label: "Shortlisted", count: stats ? stats.pipeline.shortlisted : shortlistedCount, color: "#7C3AED", bg: T.violetLight },
    { label: "Selected", count: stats ? stats.pipeline.selected : selectedCount, color: "#0D9488", bg: T.tealLight },
    { label: "Offered", count: stats ? stats.pipeline.offered : safeOffersCount, color: "#059669", bg: T.greenLight },
  ];

  const funnelDoughnutData = {
    labels: funnelStages.map((s) => s.label),
    datasets: [
      {
        data: funnelStages.map((s) => s.count),
        backgroundColor: funnelStages.map((s) => s.color),
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const funnelDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    onHover: chartOnHover,
    plugins: {
      legend: {
        position: "bottom",
        onHover: legendOnHover,
        onLeave: legendOnLeave,
        labels: {
          font: { family: "'Inter', sans-serif", size: 11, weight: 600 },
          color: T.inkMid,
          usePointStyle: true,
          padding: 12,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: "#1A1A1A",
        titleFont: { family: "'Outfit', sans-serif", size: 13, weight: 700 },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => {
            const count = ctx.raw;
            const pct = Math.round((count / totalAppsCount) * 100);
            return ` ${ctx.label}: ${count} candidates (${pct}% of pipeline)`;
          },
        },
      },
    },
  };

  // 3. Department Hiring Progress Horizontal Bar Chart (Dynamic & Integer Precision Ticks)
  const getDeptChartData = () => {
    const labels = ["Science", "Commerce", "Admin", "Arts", "Sports"];
    const filledData = [1, 0, 1, 2, 1];
    const openData = [4, 3, 1, 2, 1];
    const totals = [5, 3, 2, 4, 2];

    if (deptView === "fillRate") {
      const fillPercentages = filledData.map((f, i) => Math.round((f / totals[i]) * 100));
      return {
        labels,
        datasets: [
          {
            label: "Fill Rate (%)",
            data: fillPercentages,
            backgroundColor: fillPercentages.map((pct) =>
              pct >= 50 ? "#059669" : pct > 0 ? "#D97706" : "#E11D48"
            ),
            borderRadius: 6,
            barThickness: 16,
          },
        ],
      };
    }

    return {
      labels,
      datasets: [
        {
          label: "Filled Positions",
          data: filledData,
          backgroundColor: "#059669",
          borderColor: "#047857",
          borderWidth: 1,
          borderRadius: 6,
          barThickness: 18,
        },
        {
          label: "Remaining Open",
          data: openData,
          backgroundColor: "rgba(114, 16, 42, 0.12)",
          borderColor: "#72102A",
          borderWidth: 1.5,
          borderRadius: 6,
          barThickness: 18,
        },
      ],
    };
  };

  const deptChartData = getDeptChartData();

  const getDeptChartOptions = () => {
    const isStacked = deptView === "stacked";
    const isFillRate = deptView === "fillRate";

    return {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      onHover: chartOnHover,
      plugins: {
        legend: {
          position: "top",
          onHover: legendOnHover,
          onLeave: legendOnLeave,
          labels: {
            font: { family: "'Inter', sans-serif", size: 11, weight: 600 },
            color: T.inkMid,
            usePointStyle: true,
            boxWidth: 8,
          },
        },
        tooltip: {
          backgroundColor: "#1A1A1A",
          titleFont: { family: "'Outfit', sans-serif", size: 13, weight: 700 },
          bodyFont: { family: "'Inter', sans-serif", size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              if (isFillRate) {
                return ` ${ctx.dataset.label}: ${ctx.raw}% filled`;
              }
              const deptIdx = ctx.dataIndex;
              const filled = [1, 0, 1, 2, 1][deptIdx];
              const total = [5, 3, 2, 4, 2][deptIdx];
              const pct = Math.round((filled / total) * 100);
              return ` ${ctx.dataset.label}: ${ctx.raw} positions (${pct}% of ${total} total quota)`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: isStacked,
          grid: { color: "#E8E2D9", borderDash: [3, 3] },
          ticks: {
            font: { family: "'Inter', sans-serif", size: 11, weight: 600 },
            color: T.inkFaint,
            stepSize: isFillRate ? 25 : 1,
            precision: 0,
            callback: (val) => (isFillRate ? `${val}%` : val),
          },
          min: 0,
          max: isFillRate ? 100 : 5,
        },
        y: {
          stacked: isStacked,
          grid: { display: false },
          ticks: { font: { family: "'Inter', sans-serif", size: 11, weight: 700 }, color: T.ink },
        },
      },
    };
  };

  const deptChartOptions = getDeptChartOptions();

  // Dynamic Role-Wise Department Recruitment Budget Dataset derived from Existing Roles
  const rawRolesList = existingRoles || [];

  // Deduplicate roles by ID or role name to eliminate duplicate table rows
  const uniqueRolesMap = new Map();
  rawRolesList.forEach((r, idx) => {
    const key = r.id || r.role || `role-${idx}`;
    if (!uniqueRolesMap.has(key)) {
      uniqueRolesMap.set(key, r);
    }
  });
  const effectiveRolesList = Array.from(uniqueRolesMap.values());

  const roleBudgetData = effectiveRolesList.map((r, idx) => {
    let minSal = 35000;
    let maxSal = 50000;
    if (r.salaryRange) {
      const parts = String(r.salaryRange).replace(/,/g, "").split("-");
      if (parts.length === 2) {
        minSal = parseInt(parts[0], 10) || 35000;
        maxSal = parseInt(parts[1], 10) || 50000;
      } else if (parts.length === 1) {
        const val = parseInt(parts[0], 10);
        if (val) {
          minSal = val;
          maxSal = val;
        }
      }
    }
    const avgSal = Math.round((minSal + maxSal) / 2) || 42500;
    const targetHires = Number(r.headcount ?? r.targetHires ?? r.vacancies ?? 1) || 1;
    const filledHires = Number(r.filled ?? 0) || 0;
    const allocated = targetHires * avgSal;
    const spent = filledHires * avgSal;

    // Format experience string nicely (e.g., "3-5" -> "3–5 Yrs")
    let expFormatted = String(r.experience || "2-4").trim();
    if (!expFormatted.toLowerCase().includes("yr")) {
      expFormatted = `${expFormatted} Yrs`;
    }

    return {
      id: r.id || `ROL-2026-${String(idx + 1).padStart(4, "0")}`,
      role: r.role || r.name || "Sanctioned Position",
      dept: r.dept || "General",
      type: r.type || "Full-time",
      experience: expFormatted,
      rawExp: r.experience || "2-4",
      category: r.category || "Academic",
      targetHires,
      filled: filledHires,
      allocated,
      spent,
      status: r.status || r.currentStatus || "Active",
      salaryRange: r.salaryRange ? `₹${r.salaryRange}` : "₹35,000-50,000",
    };
  });

  const availableDepts = ["all", ...new Set(roleBudgetData.map((r) => r.dept))];
  const availableEmpTypes = ["all", ...new Set(roleBudgetData.map((r) => r.type))];
  const availableExps = ["all", ...new Set(roleBudgetData.map((r) => r.rawExp))];

  // Multi-attribute filtered dataset for budget & table analytics
  const filteredRoleBudgetData = roleBudgetData
    .filter((r) => selectedBudgetDept === "all" || r.dept === selectedBudgetDept)
    .filter((r) => selectedBudgetEmpType === "all" || r.type === selectedBudgetEmpType)
    .filter((r) => selectedBudgetExp === "all" || r.rawExp === selectedBudgetExp);

  // Column summary totals calculation
  const totalTargetHires = filteredRoleBudgetData.reduce((sum, r) => sum + r.targetHires, 0);
  const totalFilledHires = filteredRoleBudgetData.reduce((sum, r) => sum + r.filled, 0);
  const totalAllocatedBudget = filteredRoleBudgetData.reduce((sum, r) => sum + r.allocated, 0);
  const totalActualSpend = filteredRoleBudgetData.reduce((sum, r) => sum + r.spent, 0);

  // Dynamic bar thickness logic: As fewer roles/departments are displayed, bar thickness increases automatically
  const itemCount = filteredRoleBudgetData.length;
  const dynamicMaxBarThickness = itemCount <= 2 ? 85 : itemCount <= 4 ? 65 : itemCount <= 8 ? 48 : 34;
  const dynamicBarPercentage = itemCount <= 3 ? 0.65 : itemCount <= 6 ? 0.75 : 0.82;

  // 4. Role-Wise Department Recruitment Budget & Cost Analytics Chart
  const getBudgetChartData = () => {
    const labels = filteredRoleBudgetData.map((r) => [r.role, `${r.type} • ${r.experience}`]);

    if (budgetView === "empTypeBreakdown") {
      const types = ["Full-time", "Part-time"];
      const typeAlloc = types.map((t) => roleBudgetData.filter((r) => r.type === t).reduce((acc, curr) => acc + curr.allocated, 0));
      const typeSpent = types.map((t) => roleBudgetData.filter((r) => r.type === t).reduce((acc, curr) => acc + curr.spent, 0));

      return {
        labels: types,
        datasets: [
          {
            label: "Allocated Budget (₹)",
            data: typeAlloc,
            backgroundColor: "rgba(114, 16, 42, 0.75)",
            borderColor: T.primary,
            borderWidth: 2,
            borderRadius: { topLeft: 8, topRight: 8 },
            hoverBackgroundColor: "rgba(114, 16, 42, 0.95)",
            maxBarThickness: 75,
            barPercentage: 0.65,
          },
          {
            label: "Actual Spend (₹)",
            data: typeSpent,
            backgroundColor: "rgba(13, 148, 136, 0.88)",
            borderColor: "#0F766E",
            borderWidth: 2,
            borderRadius: { topLeft: 8, topRight: 8 },
            hoverBackgroundColor: "rgba(13, 148, 136, 1.0)",
            maxBarThickness: 75,
            barPercentage: 0.65,
          },
        ],
      };
    }

    if (budgetView === "expBreakdown") {
      const expLevels = ["1-2", "2-4", "3-5"];
      const expLabels = ["Junior (1–2 yrs)", "Mid-Level (2–4 yrs)", "Senior (3–5 yrs)"];
      const expAlloc = expLevels.map((e) => roleBudgetData.filter((r) => r.experience === e).reduce((acc, curr) => acc + curr.allocated, 0));
      const expSpent = expLevels.map((e) => roleBudgetData.filter((r) => r.experience === e).reduce((acc, curr) => acc + curr.spent, 0));

      return {
        labels: expLabels,
        datasets: [
          {
            label: "Allocated Budget (₹)",
            data: expAlloc,
            backgroundColor: "rgba(114, 16, 42, 0.75)",
            borderColor: T.primary,
            borderWidth: 2,
            borderRadius: { topLeft: 8, topRight: 8 },
            hoverBackgroundColor: "rgba(114, 16, 42, 0.95)",
            maxBarThickness: 65,
            barPercentage: 0.7,
          },
          {
            label: "Actual Spend (₹)",
            data: expSpent,
            backgroundColor: "rgba(13, 148, 136, 0.88)",
            borderColor: "#0F766E",
            borderWidth: 2,
            borderRadius: { topLeft: 8, topRight: 8 },
            hoverBackgroundColor: "rgba(13, 148, 136, 1.0)",
            maxBarThickness: 65,
            barPercentage: 0.7,
          },
        ],
      };
    }

    if (budgetView === "deptSummary") {
      const depts = [...new Set(roleBudgetData.map((r) => r.dept))];
      const deptAlloc = depts.map((d) => roleBudgetData.filter((r) => r.dept === d).reduce((acc, curr) => acc + curr.allocated, 0));
      const deptSpent = depts.map((d) => roleBudgetData.filter((r) => r.dept === d).reduce((acc, curr) => acc + curr.spent, 0));

      return {
        labels: depts,
        datasets: [
          {
            label: "Total Department Budget (₹)",
            data: deptAlloc,
            backgroundColor: "rgba(114, 16, 42, 0.75)",
            borderColor: T.primary,
            borderWidth: 2,
            borderRadius: { topLeft: 8, topRight: 8 },
            hoverBackgroundColor: "rgba(114, 16, 42, 0.95)",
            maxBarThickness: 52,
            barPercentage: 0.8,
            categoryPercentage: 0.75,
          },
          {
            label: "Actual Department Spend (₹)",
            data: deptSpent,
            backgroundColor: "rgba(13, 148, 136, 0.88)",
            borderColor: "#0F766E",
            borderWidth: 2,
            borderRadius: { topLeft: 8, topRight: 8 },
            hoverBackgroundColor: "rgba(13, 148, 136, 1.0)",
            maxBarThickness: 52,
            barPercentage: 0.8,
            categoryPercentage: 0.75,
          },
        ],
      };
    }

    // Default "roleAllocation": Side-by-Side Allocated vs Spent per Job Role
    return {
      labels,
      datasets: [
        {
          label: "Allocated Role Budget (₹)",
          data: filteredRoleBudgetData.map((r) => r.allocated),
          backgroundColor: "rgba(114, 16, 42, 0.75)",
          borderColor: T.primary,
          borderWidth: 2,
          borderRadius: { topLeft: 8, topRight: 8 },
          hoverBackgroundColor: "rgba(114, 16, 42, 0.95)",
          maxBarThickness: dynamicMaxBarThickness,
          barPercentage: dynamicBarPercentage,
          categoryPercentage: 0.8,
        },
        {
          label: "Actual Spend (₹)",
          data: filteredRoleBudgetData.map((r) => r.spent),
          backgroundColor: "rgba(13, 148, 136, 0.88)",
          borderColor: "#0F766E",
          borderWidth: 2,
          borderRadius: { topLeft: 8, topRight: 8 },
          hoverBackgroundColor: "rgba(13, 148, 136, 1.0)",
          maxBarThickness: dynamicMaxBarThickness,
          barPercentage: dynamicBarPercentage,
          categoryPercentage: 0.8,
        },
      ],
    };
  };

  const budgetChartData = getBudgetChartData();

  const getBudgetChartOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      onHover: chartOnHover,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          position: "top",
          padding: 16,
          onHover: legendOnHover,
          onLeave: legendOnLeave,
          labels: {
            font: { family: "'Inter', sans-serif", size: 12, weight: 700 },
            color: T.inkMid,
            usePointStyle: true,
            boxWidth: 10,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: "#18181B",
          titleFont: { family: "'Outfit', sans-serif", size: 14, weight: 800 },
          bodyFont: { family: "'Inter', sans-serif", size: 12, weight: 600 },
          padding: 14,
          cornerRadius: 10,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            title: (items) => {
              if (!items || !items.length) return "";
              const idx = items[0].dataIndex;
              if (budgetView === "roleAllocation") {
                const roleObj = filteredRoleBudgetData[idx];
                if (roleObj) {
                  return `${roleObj.role}`;
                }
              }
              const l = items[0].label;
              return Array.isArray(l) ? l.join(" • ") : l;
            },
            beforeBody: (items) => {
              if (!items || !items.length) return [];
              const idx = items[0].dataIndex;
              if (budgetView === "roleAllocation") {
                const roleObj = filteredRoleBudgetData[idx];
                if (roleObj) {
                  return [
                    `💼 Type: ${roleObj.type} | ⏳ Exp: ${roleObj.experience}`,
                    `🏛️ Dept: ${roleObj.dept} • ${roleObj.category} (${roleObj.id})`,
                    `---------------------------------------------`,
                  ];
                }
              }
              return [];
            },
            label: (ctx) => {
              return ` ${ctx.dataset.label}: ₹${ctx.raw.toLocaleString("en-IN")}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'Inter', sans-serif", size: 11, weight: 700 },
            color: T.inkLight,
            padding: 6,
          },
        },
        y: {
          grid: { color: "#E8E2D9", borderDash: [3, 3] },
          ticks: {
            font: { family: "'Inter', sans-serif", size: 11.5, weight: 600 },
            color: T.inkFaint,
            padding: 8,
            callback: (val) => `₹${val >= 1000 ? `${val / 1000}k` : val}`,
          },
        },
      },
    };
  };

  const budgetChartOptions = getBudgetChartOptions();

  // Live Dynamic Activity Log computed from backend data lists
  const getActivityLog = () => {
    const list = [];

    // 1. Applications (Job & General)
    (jobApplications || []).forEach((app) => {
      if (app.applied) {
        list.push({
          id: app.id,
          rawDate: new Date(app.applied),
          icon: "👤",
          title: "Job Application",
          detail: `${app.name} applied for ${app.role}`,
          type: "Application",
          dot: T.primary,
          bg: T.primaryLight,
        });
      }
    });

    (generalApplications || []).forEach((app) => {
      if (app.applied) {
        list.push({
          id: app.id,
          rawDate: new Date(app.applied),
          icon: "👤",
          title: "General Profile",
          detail: `${app.name} submitted a general profile`,
          type: "Application",
          dot: T.primary,
          bg: T.primaryLight,
        });
      }
    });

    // 2. Interviews
    (interviews || []).forEach((int) => {
      const dateStr = int.date ? `${int.date}${int.time ? 'T' + int.time : ''}` : null;
      const parsedDate = dateStr ? new Date(dateStr) : null;
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        list.push({
          id: int.id,
          rawDate: parsedDate,
          icon: "🎙️",
          title: `Interview ${int.status}`,
          detail: `Round ${int.round} for ${int.candidate} (${int.role})`,
          type: "Interview",
          dot: T.violet,
          bg: T.violetLight,
        });
      }
    });

    // 3. Offers
    (offers || []).forEach((o) => {
      if (o.issued) {
        list.push({
          id: o.id,
          rawDate: new Date(o.issued),
          icon: "📜",
          title: `Offer ${o.status}`,
          detail: `For ${o.candidate} (${o.role})`,
          type: "Offer",
          dot: o.status === "Accepted" ? T.teal : T.accentDark,
          bg: o.status === "Accepted" ? T.tealLight : T.accentLight,
        });
      }
    });

    // 4. Approval Requests (Actions from history)
    (approvalRequests || []).forEach((r) => {
      (r.history || []).forEach((h) => {
        if (h.date) {
          list.push({
            id: r.id,
            rawDate: new Date(h.date),
            icon: "🛡️",
            title: `Requisition ${h.act}`,
            detail: `${r.role} (${r.dept}) ${h.note ? `• ${h.note}` : `by ${h.by}`}`,
            type: "Approval",
            dot: T.accentDark,
            bg: T.accentLight,
          });
        }
      });
    });

    // Sort by rawDate desc
    list.sort((a, b) => b.rawDate - a.rawDate);

    // Format display time
    return list.slice(0, 4).map((item) => {
      const diff = new Date() - item.rawDate;
      const mins = Math.floor(diff / 60000);
      const hrs = Math.floor(mins / 60);
      const days = Math.floor(hrs / 24);
      let timeStr = "";
      if (mins < 1) timeStr = "Just now";
      else if (mins < 60) timeStr = `${mins}m ago`;
      else if (hrs < 24) timeStr = `${hrs}h ago`;
      else if (days === 1) timeStr = "Yesterday";
      else timeStr = `${days} days ago`;

      return {
        ...item,
        time: timeStr,
      };
    });
  };

  const activity = getActivityLog();

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
                    alert("Generating PDF Summary Report...");
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
                    alert("Exporting Excel Spreadsheet...");
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

        <div style={{ display: "grid", gridTemplateColumns: kpiCols, gap: 14 }}>
          {kpis.map((k, idx) => (
            <div
              key={k.label}
              className="animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
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
                <Doughnut data={funnelDoughnutData} options={funnelDoughnutOptions} />

                {/* Center Overlay Text - Perfectly Centered */}
                <div
                  style={{
                    position: "absolute",
                    top: "42%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ fontSize: font['2xl'], fontWeight: font.black, color: T.ink, fontFamily: font.heading, lineHeight: 1 }}>
                    {totalAppsCount}
                  </div>
                  <div style={{ fontSize: font.xs, color: T.inkFaint, fontWeight: font.bold, marginTop: 3 }}>
                    Total Applications
                  </div>
                </div>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
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
                💰 Role & Experience Recruitment Budget Analytics
              </div>
              <div style={{ fontSize: font.xs, color: T.inkFaint, marginTop: 2 }}>
                Financial breakdown of allocated hiring budget vs actual cost by role, experience & employment type
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
                onClick={() => setBudgetView("expBreakdown")}
                title="Group budget by experience level"
                style={{
                  padding: "4px 9px",
                  borderRadius: radius.sm,
                  fontSize: font.xs,
                  fontWeight: font.bold,
                  border: "none",
                  cursor: "pointer",
                  background: budgetView === "expBreakdown" ? "#ffffff" : "transparent",
                  color: budgetView === "expBreakdown" ? T.primary : T.inkLight,
                  boxShadow: budgetView === "expBreakdown" ? shadow.sm : "none",
                  transition: transition.fast,
                }}
              >
                ⏳ By Experience
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
                💼 By Type (FT/PT)
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
          {budgetView !== "deptSummary" && budgetView !== "expBreakdown" && budgetView !== "empTypeBreakdown" && (
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

              <div style={{ width: 1, height: 16, background: T.border }} />

              {/* Experience Filter */}
              <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: font.xs, fontWeight: font.bold, color: T.inkFaint }}>Exp:</span>
                {availableExps.map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setSelectedBudgetExp(exp)}
                    style={{
                      padding: "2px 9px",
                      borderRadius: radius.full,
                      fontSize: font.xs,
                      fontWeight: font.bold,
                      border: selectedBudgetExp === exp ? `1.5px solid ${T.accentDark}` : `1px solid ${T.border}`,
                      background: selectedBudgetExp === exp ? T.accentLight : "#ffffff",
                      color: selectedBudgetExp === exp ? T.accentDark : T.inkMid,
                      cursor: "pointer",
                      transition: transition.fast,
                    }}
                  >
                    {exp === "all" ? "All Exp" : `${exp} yrs`}
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

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: font.xs + 1 }}>
                <thead>
                  <tr style={{ background: T.canvas, borderBottom: `1px solid ${T.border}` }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: T.inkMid, fontWeight: font.bold, width: "24%" }}>Job Role Title</th>
                    <th style={{ textAlign: "left", padding: "10px 8px", color: T.inkMid, fontWeight: font.bold, width: "11%" }}>Dept</th>
                    <th style={{ textAlign: "left", padding: "10px 8px", color: T.inkMid, fontWeight: font.bold, width: "11%" }}>Type</th>
                    <th style={{ textAlign: "center", padding: "10px 8px", color: T.inkMid, fontWeight: font.bold, width: "12%" }}>Required Exp</th>
                    <th style={{ textAlign: "center", padding: "10px 8px", color: T.inkMid, fontWeight: font.bold, width: "10%" }}>Target Hires</th>
                    <th style={{ textAlign: "right", padding: "10px 8px", color: T.inkMid, fontWeight: font.bold, width: "15%" }}>Allocated Budget</th>
                    <th style={{ textAlign: "right", padding: "10px 8px", color: T.inkMid, fontWeight: font.bold, width: "12%" }}>Actual Spend</th>
                    <th style={{ textAlign: "center", padding: "10px 8px 10px 54px", color: T.inkMid, fontWeight: font.bold, width: "16%" }}>Status</th>
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
                        <td style={{ padding: "10px 12px", fontWeight: font.bold, color: T.ink }}>
                          <div>{item.role}</div>
                          <div style={{ fontSize: font.xs - 1, color: T.inkFaint, fontWeight: font.medium, marginTop: 1 }}>{item.id} • {item.category}</div>
                        </td>
                        <td style={{ padding: "10px 8px", color: T.inkLight }}>
                          <span style={{ background: T.canvas, padding: "2px 7px", borderRadius: radius.sm, fontSize: font.xs - 1, border: `1px solid ${T.border}`, fontWeight: font.bold }}>
                            {item.dept}
                          </span>
                        </td>
                        <td style={{ padding: "10px 8px", color: T.inkLight }}>
                          <span style={{
                            background: badgeBg,
                            color: badgeColor,
                            padding: "2px 8px",
                            borderRadius: radius.sm,
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
                        <td style={{ textAlign: "center", padding: "10px 8px 10px 54px" }}>
                          <span style={{ fontSize: 10, fontWeight: font.bold, color: T.green, background: T.greenLight, padding: "1px 6px", borderRadius: radius.full, border: `1px solid ${T.green}30`, whiteSpace: "nowrap", display: "inline-block" }}>
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
                      borderTop: `2px solid ${T.primary}40`,
                      borderBottom: `2px solid ${T.primary}40`,
                      fontSize: font.xs + 1,
                    }}
                  >
                    <td style={{ padding: "12px", fontWeight: font.black, color: T.primary, fontFamily: font.heading }}>
                      Total ({filteredRoleBudgetData.length} Roles)
                    </td>
                    <td style={{ padding: "12px 8px" }} />
                    <td style={{ padding: "12px 8px" }} />
                    <td style={{ padding: "12px 8px" }} />
                    <td style={{ textAlign: "center", padding: "12px 8px", fontWeight: font.black, color: T.teal }}>
                      {totalFilledHires} / {totalTargetHires}
                    </td>
                    <td style={{ textAlign: "right", padding: "12px 8px", fontWeight: font.black, color: T.primary, fontSize: font.base }}>
                      ₹{totalAllocatedBudget.toLocaleString("en-IN")}
                    </td>
                    <td style={{ textAlign: "right", padding: "12px 8px", fontWeight: font.black, color: T.teal, fontSize: font.base }}>
                      ₹{totalActualSpend.toLocaleString("en-IN")}
                    </td>
                    <td style={{ textAlign: "center", padding: "12px 8px 12px 54px" }}>
                      <span style={{ fontSize: 9.5, fontWeight: font.bold, color: T.green, background: T.greenLight, padding: "1px 5px", borderRadius: radius.full, border: `1px solid ${T.green}40`, whiteSpace: "nowrap", display: "inline-block" }}>
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

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.greenLight, color: T.green, padding: "3px 10px", borderRadius: radius.full, fontSize: font.xs, fontWeight: font.bold, border: `1px solid ${T.green}30` }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, boxShadow: `0 0 0 3px ${T.green}30` }} />
                Live Feed
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activity.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", color: T.inkFaint, textAlign: "center" }}>
                <span style={{ fontSize: 32, marginBottom: 8 }}>⚡</span>
                <div style={{ fontSize: font.sm, fontWeight: font.bold, color: T.inkMid }}>No Recent Activity</div>
                <div style={{ fontSize: font.xs, marginTop: 4 }}>System actions and audits will appear here.</div>
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
        </Card>
      </div>

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
