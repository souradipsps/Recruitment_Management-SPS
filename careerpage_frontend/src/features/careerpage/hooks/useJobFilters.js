import { useMemo, useState } from "react";
import { jobs } from "../../../data/jobs";

const JOBS_VISIBLE = 4;

// Owns the search box, category filter and "see more" paging for the
// opportunities listing.
export function useJobFilters() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Positions");
  const [showAll, setShowAll] = useState(false);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchesCategory =
        activeCategory === "All Positions" || j.category === activeCategory;
      const matchesSearch =
        search === "" ||
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.department.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

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
