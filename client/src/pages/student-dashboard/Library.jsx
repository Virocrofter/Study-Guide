
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

/* ─── FAKE DATA ─── */
const FAKE_FLASHCARD_SETS = [
  {
    _id: "fc1",
    title: "General trivia",
    termCount: 7,
    author: "Quizlet",
    authorAvatar: "Q",
    authorColor: "bg-blue-500",
    verified: true,
    isDraft: false,
    isPrivate: false,
    dateGroup: "THIS WEEK",
  },
  {
    _id: "fc2",
    title: "Nothing Phone (2a) 12GB/256GB Specs & Features Overview",
    termCount: 18,
    author: "Vincent_Okpeku",
    authorAvatar: "V",
    authorColor: "bg-emerald-500",
    verified: false,
    isDraft: false,
    isPrivate: false,
    dateGroup: "IN MARCH 2026",
  },
  {
    _id: "fc3",
    title: "JavaScript ES6+ Features",
    termCount: 24,
    author: "DevMastery",
    authorAvatar: "D",
    authorColor: "bg-purple-500",
    verified: true,
    isDraft: false,
    isPrivate: false,
    dateGroup: "IN MARCH 2026",
  },
  {
    _id: "fc4",
    title: "React Hooks Deep Dive",
    termCount: 15,
    author: "CodeWithMosh",
    authorAvatar: "C",
    authorColor: "bg-orange-500",
    verified: false,
    isDraft: false,
    isPrivate: false,
    dateGroup: "IN MARCH 2026",
  },
  {
    _id: "fc5",
    title: "Untitled set",
    termCount: 0,
    author: "You",
    authorAvatar: "Y",
    authorColor: "bg-gray-500",
    verified: false,
    isDraft: true,
    isPrivate: true,
    dateGroup: "IN PROGRESS",
  },
];

const FAKE_FOLDERS = [
  { _id: "f1", name: "Web Development", setCount: 3, color: "bg-blue-500", dateGroup: "THIS WEEK" },
  { _id: "f2", name: "Exam Prep", setCount: 5, color: "bg-emerald-500", dateGroup: "THIS WEEK" },
  { _id: "f3", name: "Random Facts", setCount: 2, color: "bg-purple-500", dateGroup: "IN MARCH 2026" },
  { _id: "f4", name: "Old Notes", setCount: 8, color: "bg-gray-500", dateGroup: "OLDER" },
];

const FAKE_PRACTICE_TESTS = [
  { _id: "pt1", title: "JavaScript Basics", questionCount: 20, score: 85, author: "Quizlet", dateGroup: "THIS WEEK" },
  { _id: "pt2", title: "React Fundamentals", questionCount: 15, score: 92, author: "DevMastery", dateGroup: "THIS WEEK" },
  { _id: "pt3", title: "CSS Grid & Flexbox", questionCount: 12, score: 78, author: "CSSWizard", dateGroup: "IN MARCH 2026" },
  { _id: "pt4", title: "TypeScript Essentials", questionCount: 18, score: 88, author: "TypeMaster", dateGroup: "OLDER" },
];

const FAKE_STUDY_GUIDES = [
  { _id: "sg1", title: "Frontend Interview Prep", pageCount: 12, author: "TechLead", dateGroup: "THIS WEEK" },
  { _id: "sg2", title: "System Design Notes", pageCount: 8, author: "EngineeringDaily", dateGroup: "THIS WEEK" },
  { _id: "sg3", title: "React Patterns 2026", pageCount: 15, author: "ReactTeam", dateGroup: "IN MARCH 2026" },
  { _id: "sg4", title: "MongoDB Cheatsheet", pageCount: 5, author: "DBAdmin", dateGroup: "OLDER" },
];

/* ─── GROUP ORDER ─── */
const GROUP_ORDER = ["IN PROGRESS", "THIS WEEK", "IN MARCH 2026", "OLDER"];

/* ─── HELPERS ─── */
const groupByDate = (items) => {
  const groups = {};
  items.forEach((item) => {
    const key = item.dateGroup || "OLDER";
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  const ordered = {};
  GROUP_ORDER.forEach((key) => {
    if (groups[key]) ordered[key] = groups[key];
  });
  Object.keys(groups).forEach((key) => {
    if (!ordered[key]) ordered[key] = groups[key];
  });
  return ordered;
};

/* ─── SHARED CARD WRAPPER ─── */
const CardWrapper = ({ children, onClick }) => (
  <div
    onClick={onClick}
    className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-all border-b-4 border-transparent hover:border-blue-400"
  >
    {children}
  </div>
);

/* ─── SECTION HEADER ─── */
const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-4 mb-4">
    <h2 className="text-gray-400 text-sm font-bold tracking-wider uppercase whitespace-nowrap">{title}</h2>
    <div className="flex-1 h-px bg-gray-700" />
  </div>
);

/* ─── COMPONENTS ─── */

const VerifiedBadge = () => (
  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-400 text-white text-[10px] font-bold ml-1">
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  </span>
);

const LockIcon = () => (
  <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const AuthorMeta = ({ avatar, color, name, verified }) => (
  <div className="flex items-center gap-1.5">
    <span className={`w-5 h-5 rounded-full ${color} flex items-center justify-center text-white text-[10px] font-bold`}>
      {avatar}
    </span>
    <span className="text-gray-300 text-sm">{name}</span>
    {verified && <VerifiedBadge />}
  </div>
);

/* ─── FLASHCARD CARD ─── */
const FlashcardSetCard = ({ set, onClick }) => (
  <CardWrapper onClick={onClick}>
    {set.isDraft ? (
      <div className="flex items-center gap-2">
        <span className="text-white font-bold text-lg">(Draft)</span>
        <LockIcon />
      </div>
    ) : (
      <>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-300 text-sm">{set.termCount} terms</span>
          <span className="text-gray-500">|</span>
          <AuthorMeta avatar={set.authorAvatar} color={set.authorColor} name={set.author} verified={set.verified} />
        </div>
        <h3 className="text-white font-bold text-lg leading-tight">{set.title}</h3>
      </>
    )}
  </CardWrapper>
);

/* ─── FOLDER CARD ─── */
const FolderCard = ({ folder, onClick }) => (
  <CardWrapper onClick={onClick}>
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${folder.color} flex items-center justify-center flex-shrink-0`}>
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>
      <div>
        <h3 className="text-white font-bold text-lg">{folder.name}</h3>
        <p className="text-gray-400 text-sm">{folder.setCount} sets</p>
      </div>
    </div>
  </CardWrapper>
);

/* ─── PRACTICE TEST CARD ─── */
const PracticeTestCard = ({ test, onClick }) => (
  <CardWrapper onClick={onClick}>
    <div className="flex items-center gap-2 mb-2">
      <span className="text-gray-300 text-sm">{test.questionCount} questions</span>
      <span className="text-gray-500">|</span>
      <span className="text-gray-300 text-sm">{test.author}</span>
    </div>
    <h3 className="text-white font-bold text-lg mb-2">{test.title}</h3>
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-600 rounded-full h-2">
        <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${test.score}%` }} />
      </div>
      <span className="text-emerald-400 text-sm font-bold">{test.score}%</span>
    </div>
  </CardWrapper>
);

/* ─── STUDY GUIDE CARD ─── */
const StudyGuideCard = ({ guide, onClick }) => (
  <CardWrapper onClick={onClick}>
    <div className="flex items-center gap-2 mb-2">
      <span className="text-gray-300 text-sm">{guide.pageCount} pages</span>
      <span className="text-gray-500">|</span>
      <span className="text-gray-300 text-sm">{guide.author}</span>
    </div>
    <h3 className="text-white font-bold text-lg">{guide.title}</h3>
  </CardWrapper>
);

/* ─── GROUPED LIST RENDERER ─── */
const GroupedList = ({ groupedItems, renderCard, emptyMessage }) => {
  const keys = Object.keys(groupedItems);
  if (keys.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="space-y-10">
      {keys.map((groupName) => (
        <div key={groupName}>
          <SectionHeader title={groupName} />
          <div className="space-y-3">
            {groupedItems[groupName].map((item) => renderCard(item))}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── MAIN PAGE ─── */
const Library = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("flashcards");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Recent");
  const [sortOpen, setSortOpen] = useState(false);

  const tabs = [
    { id: "flashcards", label: "Flashcard sets" },
    { id: "folders", label: "Folders" },
    { id: "practice", label: "Practice Tests" },
    { id: "guides", label: "Study guides" },
  ];

  const filterBySearch = (items, searchField) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) => item[searchField].toLowerCase().includes(q));
  };

  const flashcardSets = useMemo(() => groupByDate(filterBySearch(FAKE_FLASHCARD_SETS, "title")), [searchQuery]);
  const folders = useMemo(() => groupByDate(filterBySearch(FAKE_FOLDERS, "name")), [searchQuery]);
  const practiceTests = useMemo(() => groupByDate(filterBySearch(FAKE_PRACTICE_TESTS, "title")), [searchQuery]);
  const studyGuides = useMemo(() => groupByDate(filterBySearch(FAKE_STUDY_GUIDES, "title")), [searchQuery]);

  const handleCardClick = (id) => {
    if (activeTab === "flashcards") navigate(`/student/flash-cards?set=${id}`);
    else if (activeTab === "folders") navigate(`/student/flash-cards/folder/${id}`);
    else if (activeTab === "practice") navigate(`/student/practice-tests/${id}`);
    else if (activeTab === "guides") navigate(`/student/study-guides/${id}`);
  };

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "flashcards": return "Search flashcards";
      case "folders": return "Search folders";
      case "practice": return "Search practice tests";
      case "guides": return "Search study guides";
      default: return "Search";
    }
  };

  return (
    <div className="min-h-full bg-[#0f0f23] text-white p-6 md:p-8">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-10">Your library</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchQuery(""); }}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-transparent border-2 border-white text-white"
                : "bg-gray-700 text-white hover:bg-gray-600 border-2 border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            {sortBy}
            <svg className={`w-4 h-4 transition-transform ${sortOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {sortOpen && (
            <div className="absolute top-full left-0 mt-2 bg-gray-700 rounded-xl shadow-xl py-2 z-10 min-w-[140px]">
              {["Recent", "Alphabetical", "Created by me"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setSortBy(opt); setSortOpen(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-600 transition-colors ${
                    sortBy === opt ? "text-emerald-400 font-medium" : "text-white"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getSearchPlaceholder()}
            className="w-full bg-gray-700 text-white placeholder-gray-400 px-5 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12"
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* ─── FLASHCARDS TAB ─── */}
      {activeTab === "flashcards" && (
        <GroupedList
          groupedItems={flashcardSets}
          emptyMessage="No flashcard sets found."
          renderCard={(set) => (
            <FlashcardSetCard key={set._id} set={set} onClick={() => handleCardClick(set._id)} />
          )}
        />
      )}

      {/* ─── FOLDERS TAB ─── */}
      {activeTab === "folders" && (
        <GroupedList
          groupedItems={folders}
          emptyMessage="No folders found."
          renderCard={(folder) => (
            <FolderCard key={folder._id} folder={folder} onClick={() => handleCardClick(folder._id)} />
          )}
        />
      )}

      {/* ─── PRACTICE TESTS TAB ─── */}
      {activeTab === "practice" && (
        <GroupedList
          groupedItems={practiceTests}
          emptyMessage="No practice tests found."
          renderCard={(test) => (
            <PracticeTestCard key={test._id} test={test} onClick={() => handleCardClick(test._id)} />
          )}
        />
      )}

      {/* ─── STUDY GUIDES TAB ─── */}
      {activeTab === "guides" && (
        <GroupedList
          groupedItems={studyGuides}
          emptyMessage="No study guides found."
          renderCard={(guide) => (
            <StudyGuideCard key={guide._id} guide={guide} onClick={() => handleCardClick(guide._id)} />
          )}
        />
      )}
    </div>
  );
};

export default Library;