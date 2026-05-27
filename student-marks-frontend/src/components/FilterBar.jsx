import React from 'react';

const FilterBar = ({
  searchQuery,
  setSearchQuery,
  selectedSubject,
  setSelectedSubject,
  selectedGradeCategory,
  setSelectedGradeCategory,
  sortBy,
  setSortBy
}) => {
  return (
    <div className="filter-bar glass-card">
      <div className="filter-search">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by Name, Roll No, or Subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="filter-options">
        <div className="filter-group">
          <label htmlFor="filter-subject">Subject</label>
          <select
            id="filter-subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="All">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Computer Science">Computer Science</option>
            <option value="English">English</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-grade">Performance</label>
          <select
            id="filter-grade"
            value={selectedGradeCategory}
            onChange={(e) => setSelectedGradeCategory(e.target.value)}
          >
            <option value="All">All Grades</option>
            <option value="Distinction">Distinction (≥ 80)</option>
            <option value="Pass">Pass (≥ 50)</option>
            <option value="Fail">Fail (&lt; 50)</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-by">Sort By</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date-desc">Latest Added</option>
            <option value="name-asc">Name (A - Z)</option>
            <option value="name-desc">Name (Z - A)</option>
            <option value="marks-desc">Marks (High - Low)</option>
            <option value="marks-asc">Marks (Low - High)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
