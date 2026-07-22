import { useEffect, useMemo, useState } from "react";
import { fetchPublicJobs } from "../services/jobsService";

const JOBS_VISIBLE = 4;

// Owns fetching the live job postings plus the search box, category filter and
// "see more" paging for the opportunities listing.
export function useJobFilters() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Positions");
  const [showAll, setShowAll] = useState(false);

  // Load the published jobs once on mount. `loading` already starts true and
  // `error` null, so the effect only needs to record the outcome.
  useEffect(() => {
    let cancelled = false;

    fetchPublicJobs()
      .then((data) => {
        if (!cancelled) setJobs(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load opportunities.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchesCategory =
        activeCategory === "All Positions" || j.category === activeCategory;
      const matchesSearch =
        search === "" ||
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        (j.department ?? "").toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [jobs, search, activeCategory]);

  const visibleJobs = showAll ? filteredJobs : filteredJobs.slice(0, JOBS_VISIBLE);

  const onSearchChange = (value) => {
    setSearch(value);
    setShowAll(false);
  };

  const onCategoryChange = (cat) => {
    setActiveCategory(cat);
    setShowAll(false);
  };

  return {
    jobs,
    loading,
    error,
    search,
    activeCategory,
    showAll,
    setShowAll,
    filteredJobs,
    visibleJobs,
    onSearchChange,
    onCategoryChange,
    JOBS_VISIBLE,
  };
}
