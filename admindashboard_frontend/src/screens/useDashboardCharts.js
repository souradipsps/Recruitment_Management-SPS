import { T } from "../theme";

export default function useDashboardCharts({
  approvalRequests = [],
  jobPostings = [],
  jobApplications = [],
  generalApplications = [],
  interviews = [],
  offers = [],
  existingRoles = [],
  stats = null,
  chartView,
  deptView,
  budgetView,
  selectedBudgetDept,
  selectedBudgetEmpType,
  selectedBudgetExp,
}) {
  const now = new Date();

  const totalAppsCount = stats ? stats.totalApplicants : ((jobApplications || []).length + (generalApplications || []).length);
  const offersCount = stats ? stats.offersReleased : (offers || []).length;

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

  // ── Hover Handlers ────────────────────────────────────────────────────────

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

  // ── 1. Monthly Trends Chart ───────────────────────────────────────────────

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

  // ── 2. Candidate Funnel Doughnut Chart & Funnel Stages ────────────────────

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

  // ── 3. Department Hiring Progress Horizontal Bar Chart ────────────────────

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

  // ── 4. Role-Wise Department Recruitment Budget Analytics ──────────────────

  const rawRolesList = existingRoles || [];
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

  const filteredRoleBudgetData = roleBudgetData
    .filter((r) => selectedBudgetDept === "all" || r.dept === selectedBudgetDept)
    .filter((r) => selectedBudgetEmpType === "all" || r.type === selectedBudgetEmpType)
    .filter((r) => selectedBudgetExp === "all" || r.rawExp === selectedBudgetExp);

  const totalTargetHires = filteredRoleBudgetData.reduce((sum, r) => sum + r.targetHires, 0);
  const totalFilledHires = filteredRoleBudgetData.reduce((sum, r) => sum + r.filled, 0);
  const totalAllocatedBudget = filteredRoleBudgetData.reduce((sum, r) => sum + r.allocated, 0);
  const totalActualSpend = filteredRoleBudgetData.reduce((sum, r) => sum + r.spent, 0);

  const itemCount = filteredRoleBudgetData.length;
  const dynamicMaxBarThickness = itemCount <= 2 ? 85 : itemCount <= 4 ? 65 : itemCount <= 8 ? 48 : 34;
  const dynamicBarPercentage = itemCount <= 3 ? 0.65 : itemCount <= 6 ? 0.75 : 0.82;

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

  // ── 5. Live Dynamic Activity Log ──────────────────────────────────────────

  const getActivityLog = () => {
    const list = [];

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

    list.sort((a, b) => b.rawDate - a.rawDate);

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

  return {
    monthlyChartData: getMonthlyChartData(),
    monthlyChartOptions: getMonthlyChartOptions(),
    funnelStages,
    funnelDoughnutData,
    funnelDoughnutOptions,
    shortlistedCount,
    selectedCount,
    safeOffersCount,
    deptChartData: getDeptChartData(),
    deptChartOptions: getDeptChartOptions(),
    roleBudgetData,
    availableDepts,
    availableEmpTypes,
    availableExps,
    filteredRoleBudgetData,
    totalTargetHires,
    totalFilledHires,
    totalAllocatedBudget,
    totalActualSpend,
    budgetChartData: getBudgetChartData(),
    budgetChartOptions: getBudgetChartOptions(),
    activity: getActivityLog(),
  };
}
