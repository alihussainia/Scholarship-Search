import { useState, useMemo, useEffect, MouseEvent } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Users, 
  Presentation, 
  Coins, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  ArrowUpRight, 
  X, 
  Bookmark, 
  Sparkles, 
  Globe, 
  MapPin, 
  User, 
  Cpu, 
  BookOpen, 
  FileDown, 
  RotateCcw, 
  CheckCircle2, 
  Check,
  ChevronRight,
  TrendingUp,
  Award,
  BookMarked,
  Info,
  NotebookTabs
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { opportunities, Opportunity } from './data/opportunities';

export default function App() {
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedField, setSelectedField] = useState<string>('All');
  const [selectedMatchFilter, setSelectedMatchFilter] = useState<string>('All');
  const [selectedDuration, setSelectedDuration] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'deadline' | 'name-asc' | 'name-desc'>('deadline');
  
  // Bookmark and Notes States (Persisted in localStorage)
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    const saved = localStorage.getItem('opp_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [notes, setNotes] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('opp_notes');
    return saved ? JSON.parse(saved) : {};
  });

  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [activeOpportunity, setActiveOpportunity] = useState<Opportunity | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('opp_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('opp_notes', JSON.stringify(notes));
  }, [notes]);

  // Toast message utility
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle bookmark function
  const toggleBookmark = (id: number, e: MouseEvent) => {
    e.stopPropagation();
    if (bookmarks.includes(id)) {
      setBookmarks(bookmarks.filter(bId => bId !== id));
      showToast('Opportunity removed from shortlisted dashboard.');
    } else {
      setBookmarks([...bookmarks, id]);
      showToast('Added to your shortlisted opportunities dashboard.');
    }
  };

  // Save notes for active opportunity
  const saveNote = (id: number) => {
    setNotes(prev => ({ ...prev, [id]: tempNote }));
    showToast('Application notes saved successfully.');
  };

  // Set selected notes on active opportunity change
  useEffect(() => {
    if (activeOpportunity) {
      setTempNote(notes[activeOpportunity.id] || '');
    }
  }, [activeOpportunity, notes]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedField('All');
    setSelectedMatchFilter('All');
    setSelectedDuration('All');
    setSortBy('deadline');
    setShowBookmarksOnly(false);
    showToast('All filter criteria reset.');
  };

  // Helper function to check custom profile match types
  const getMatchTypes = (opp: Opportunity) => {
    const types: string[] = [];
    const lowerName = opp.name.toLowerCase();
    const lowerHost = opp.host.toLowerCase();
    const lowerSuitability = opp.suitability.toLowerCase();

    // 1. Luxembourg Local Matches (institutions physically inside or borders)
    const luxKeywords = ['luxembourg', 'esm', 'eib', 'eif', 'eurostat', 'liser', 'fnr', 'snt'];
    const hasLux = luxKeywords.some(kw => 
      lowerName.includes(kw) || 
      lowerHost.includes(kw) || 
      lowerSuitability.includes(kw)
    );
    if (hasLux) {
      types.push('Luxembourg Local');
    }

    // 2. Pakistani Citizen Priority Matches (FCDO, Chevening, USEFP, USAID, ADB-Japan, etc.)
    const pakKeywords = ['pakistan', 'developing countries', 'developing nation', 'global south', 'chevening', 'fulbright', 'usefp', 'rhodes', 'isdb'];
    const hasPak = pakKeywords.some(kw => 
      lowerName.includes(kw) || 
      opp.eligibility.toLowerCase().includes(kw) || 
      lowerSuitability.includes(kw)
    );
    if (hasPak) {
      types.push('Pakistani Eligible');
    }

    // 3. Quantitative Finance & AI Convergence
    const csKeywords = ['computer science', 'ai', 'stem', 'machine learning', 'data', 'algorithm', 'system', 'cern', 'computing'];
    const finKeywords = ['finance', 'econ', 'economics', 'macroeconomics', 'risk', 'bank', 'invest', 'econometrics', 'quantitative'];
    
    const hasCS = csKeywords.some(kw => lowerName.includes(kw) || opp.field === 'AI & STEM' || lowerSuitability.includes(kw));
    const hasFin = finKeywords.some(kw => lowerName.includes(kw) || opp.field === 'Finance & Economics' || lowerSuitability.includes(kw));
    
    if (hasCS && hasFin) {
      types.push('FinTech / AI Convergence');
    }

    // 4. Australia Focus (CSIRO, Australian universities, Melbourne, Sydney, QUT, UQ, UNSW, etc.)
    const ausKeywords = ['australia', 'csiro', 'sydney', 'melbourne', 'queensland', 'monash', 'anu', 'adelaide', 'uts', 'la trobe', 'unsw', 'curtin', 'deakin', 'griffith', 'rmit', 'macquarie', 'wollongong', 'australian', 'aims', 'academy of science', 'qut'];
    const hasAus = ausKeywords.some(kw => 
      lowerName.includes(kw) || 
      lowerHost.includes(kw) || 
      lowerSuitability.includes(kw) ||
      opp.eligibility.toLowerCase().includes(kw)
    );
    if (hasAus) {
      types.push('Australia Focus');
    }

    return types;
  };

  // Helper function to map duration to a simplified category
  const getDurationCategory = (duration: string) => {
    const lower = duration.toLowerCase();
    
    // Check for multi-year programs or PhD/Doctorate/Permanent
    if (
      lower.includes('years') || 
      lower.includes('phd') || 
      lower.includes('doctorate') || 
      lower.includes('permanent') ||
      lower.includes('2 year') ||
      lower.includes('3 year') ||
      lower.includes('4 year') ||
      lower.includes('5 year')
    ) {
      return 'Long';
    }
    
    // Check for short term (days, weeks up to 12 weeks, months up to 3 months)
    if (lower.includes('day') || lower.includes('days')) {
      return 'Short';
    }
    
    if (lower.includes('week') || lower.includes('weeks')) {
      const match = lower.match(/(\d+)\s*week/);
      if (match) {
        const weeks = parseInt(match[1]);
        if (weeks <= 12) return 'Short';
      } else {
        return 'Short';
      }
    }
    
    if (lower.includes('month') || lower.includes('months')) {
      const match = lower.match(/(\d+)\s*month/);
      if (match) {
        const months = parseInt(match[1]);
        if (months <= 3) return 'Short';
      }
    }
    
    return 'Medium';
  };

  // Memoized filtered and sorted opportunities list
  const filteredOpportunities = useMemo(() => {
    let result = opportunities;

    // Search query matching
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(opp => 
        opp.name.toLowerCase().includes(query) ||
        opp.host.toLowerCase().includes(query) ||
        opp.eligibility.toLowerCase().includes(query) ||
        opp.funding.toLowerCase().includes(query) ||
        opp.suitability.toLowerCase().includes(query) ||
        opp.category.toLowerCase().includes(query) ||
        opp.field.toLowerCase().includes(query)
      );
    }

    // Category dropdown filtering
    if (selectedCategory !== 'All') {
      result = result.filter(opp => opp.category === selectedCategory);
    }

    // Field/Discipline dropdown filtering
    if (selectedField !== 'All') {
      result = result.filter(opp => opp.field === selectedField);
    }

    // Custom Profile Match category filtering
    if (selectedMatchFilter !== 'All') {
      result = result.filter(opp => {
        const matches = getMatchTypes(opp);
        return matches.includes(selectedMatchFilter);
      });
    }

    // Duration filtering
    if (selectedDuration !== 'All') {
      result = result.filter(opp => getDurationCategory(opp.duration) === selectedDuration);
    }

    // Bookmarks filtering
    if (showBookmarksOnly) {
      result = result.filter(opp => bookmarks.includes(opp.id));
    }

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  }, [searchTerm, selectedCategory, selectedField, selectedMatchFilter, selectedDuration, sortBy, bookmarks, showBookmarksOnly]);

  // Calculate high-level metrics
  const stats = useMemo(() => {
    const list = opportunities;
    let localLuxCount = 0;
    let pakCitizenCount = 0;
    let crossDisciplinaryCount = 0;
    let australiaFocusCount = 0;
    let shortCount = 0;
    let mediumCount = 0;
    let longCount = 0;

    list.forEach(opp => {
      const tags = getMatchTypes(opp);
      if (tags.includes('Luxembourg Local')) localLuxCount++;
      if (tags.includes('Pakistani Eligible')) pakCitizenCount++;
      if (tags.includes('FinTech / AI Convergence')) crossDisciplinaryCount++;
      if (tags.includes('Australia Focus')) australiaFocusCount++;
      
      const dur = getDurationCategory(opp.duration);
      if (dur === 'Short') shortCount++;
      else if (dur === 'Medium') mediumCount++;
      else if (dur === 'Long') longCount++;
    });

    return {
      total: list.length,
      filteredMatches: filteredOpportunities.length,
      luxLocal: localLuxCount,
      pakDirect: pakCitizenCount,
      crossDisciplinary: crossDisciplinaryCount,
      australiaFocus: australiaFocusCount,
      shortDuration: shortCount,
      mediumDuration: mediumCount,
      longDuration: longCount,
      totalBookmarked: bookmarks.length
    };
  }, [filteredOpportunities, bookmarks]);

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Scholarship': return <GraduationCap className="w-4 h-4" />;
      case 'Fellowship': return <Users className="w-4 h-4" />;
      case 'Internship': return <Briefcase className="w-4 h-4" />;
      case 'Conference': return <Presentation className="w-4 h-4" />;
      case 'Grant': return <Coins className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  // Field color theme helper
  const getFieldTheme = (field: string) => {
    switch (field) {
      case 'AI & STEM': 
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-100',
          badge: 'bg-blue-600',
          accent: 'text-blue-600',
          border: 'hover:border-blue-300'
        };
      case 'Finance & Economics': 
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          badge: 'bg-emerald-600',
          accent: 'text-emerald-600',
          border: 'hover:border-emerald-300'
        };
      case 'Policy & Development': 
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-100',
          badge: 'bg-amber-600',
          accent: 'text-amber-600',
          border: 'hover:border-amber-300'
        };
      default: 
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-100',
          badge: 'bg-purple-600',
          accent: 'text-purple-600',
          border: 'hover:border-purple-300'
        };
    }
  };

  // Export Bookmarks as JSON
  const exportBookmarksAsJSON = () => {
    const bookmarkedOpps = opportunities.filter(opp => bookmarks.includes(opp.id));
    const bookmarksWithNotes = bookmarkedOpps.map(opp => ({
      ...opp,
      myNotes: notes[opp.id] || ''
    }));

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookmarksWithNotes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "shortlisted_funding_opportunities.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Opportunities plan exported successfully.');
  };

  // Format date to readable string
  const formatDeadlineDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-12 selection:bg-indigo-100">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg border border-slate-800 flex items-center space-x-2 text-xs font-medium"
            id="toast-notification"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <header className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white py-12 px-6 shadow-md relative overflow-hidden" id="app-header">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.2),rgba(255,255,255,0))] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
          
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 mr-1 animate-pulse" />
              100% Fully Funded • No Application Fees
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
              Youth Opportunities Portal
            </h1>
            <p className="text-slate-300 max-w-2xl text-sm md:text-base leading-relaxed">
              An interactive database tracking <strong>{opportunities.length} fully-funded</strong> scholarships, fellowships, research internships, and project grants with active deadlines starting on or after June 30, 2026. Custom-mapped to your exact academic profile.
            </p>
          </div>

          {/* Profile Match Card */}
          <div className="bg-slate-800/65 backdrop-blur-md border border-slate-700/80 p-5 rounded-2xl shadow-xl text-xs space-y-3.5 w-full lg:w-96" id="profile-match-badge">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <span className="text-indigo-400 font-bold flex items-center tracking-wider uppercase text-[10px]">
                <User className="w-3.5 h-3.5 mr-1.5" />
                Target Search Profile
              </span>
              <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                Active Matcher
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center"><MapPin className="w-3 h-3 mr-1 text-rose-400" /> Residency:</span>
                <span className="text-slate-200 font-semibold text-right">Luxembourg (EU Resident)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center"><Globe className="w-3 h-3 mr-1 text-emerald-400" /> Nationality:</span>
                <span className="text-slate-200 font-semibold text-right">Pakistani National</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400 flex items-center mt-0.5"><Cpu className="w-3 h-3 mr-1 text-indigo-400" /> Academic Base:</span>
                <span className="text-slate-200 font-semibold text-right max-w-[190px]">
                  MSc Finance & Economics + CS/AI Background
                </span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10">

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" id="stats-dashboard">
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 flex items-center transition-all hover:shadow-md">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl mr-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Database</p>
              <p className="text-2xl font-black text-slate-800">{stats.total} Opps</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 flex items-center transition-all hover:shadow-md">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mr-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Matches</p>
              <p className="text-2xl font-black text-emerald-600">{stats.filteredMatches}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 flex items-center transition-all hover:shadow-md">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl mr-4">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shortlisted Opps</p>
              <p className="text-2xl font-black text-amber-600">{stats.totalBookmarked}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 flex items-center transition-all hover:shadow-md">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl mr-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Profile</p>
              <p className="text-2xl font-black text-rose-600">Perfect Fit</p>
            </div>
          </div>

        </div>

        {/* Filters and Controls Card */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 mb-8 space-y-4" id="filters-section">
          
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by program, provider, host city, eligibility, or match suitability..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-700 placeholder:text-slate-400 transition-all"
                id="search-bar"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 text-xs font-semibold p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="w-full lg:w-48">
              <div className="relative">
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-700 font-medium appearance-none cursor-pointer transition-all"
                  id="category-filter"
                >
                  <option value="All">All Categories</option>
                  <option value="Scholarship">Scholarships</option>
                  <option value="Fellowship">Fellowships</option>
                  <option value="Internship">Internships</option>
                  <option value="Conference">Conferences</option>
                  <option value="Grant">Grants</option>
                </select>
                <Filter className="w-3 h-3 absolute right-4 top-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Field Dropdown */}
            <div className="w-full lg:w-48">
              <div className="relative">
                <select 
                  value={selectedField} 
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-700 font-medium appearance-none cursor-pointer transition-all"
                  id="field-filter"
                >
                  <option value="All">All Disciplines</option>
                  <option value="AI & STEM">AI & STEM</option>
                  <option value="Finance & Economics">Finance & Economics</option>
                  <option value="Policy & Development">Policy & Development</option>
                  <option value="General">General / Other</option>
                </select>
                <Filter className="w-3 h-3 absolute right-4 top-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Custom Match Type Filter */}
            <div className="w-full lg:w-56">
              <div className="relative">
                <select 
                  value={selectedMatchFilter} 
                  onChange={(e) => setSelectedMatchFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-700 font-semibold appearance-none cursor-pointer text-indigo-700 transition-all"
                  id="match-filter"
                >
                  <option value="All">All Profile Alignments</option>
                  <option value="Luxembourg Local">Luxembourg Local Matches ({stats.luxLocal})</option>
                  <option value="Pakistani Eligible">Pakistani Open Options ({stats.pakDirect})</option>
                  <option value="FinTech / AI Convergence">Finance / AI Convergence ({stats.crossDisciplinary})</option>
                  <option value="Australia Focus">Australia Focus ({stats.australiaFocus})</option>
                </select>
                <Sparkles className="w-3.5 h-3.5 absolute right-4 top-4 text-indigo-500 pointer-events-none" />
              </div>
            </div>

            {/* Duration Dropdown */}
            <div className="w-full lg:w-52">
              <div className="relative">
                <select 
                  value={selectedDuration} 
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-700 font-medium appearance-none cursor-pointer transition-all"
                  id="duration-filter"
                >
                  <option value="All">All Durations</option>
                  <option value="Short">Short Term (≤ 3 Months) ({stats.shortDuration})</option>
                  <option value="Medium">Medium Term (3 - 12 Months) ({stats.mediumDuration})</option>
                  <option value="Long">Long Term (1+ Years) ({stats.longDuration})</option>
                </select>
                <Clock className="w-3.5 h-3.5 absolute right-4 top-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Quick Tags and Toggle row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
            
            {/* Quick search shortcuts */}
            <div className="flex flex-wrap items-center gap-1.5 text-slate-500">
              <span className="font-semibold text-slate-400 mr-1 flex items-center">
                <Filter className="w-3.5 h-3.5 mr-1" /> Quick Queries:
              </span>
              <button 
                onClick={() => { setSelectedMatchFilter('Australia Focus'); setSelectedCategory('All'); setSelectedField('All'); setSelectedDuration('All'); setSearchTerm(''); setShowBookmarksOnly(false); }}
                className="bg-sky-50 text-sky-700 hover:bg-sky-100 px-3 py-1 rounded-full border border-sky-200 hover:border-sky-300 font-bold transition-all cursor-pointer"
              >
                Australia Focus 🇦🇺
              </button>
              <button 
                onClick={() => { setSearchTerm('Luxembourg'); setSelectedMatchFilter('All'); setShowBookmarksOnly(false); }}
                className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1 rounded-full border border-slate-200 hover:border-indigo-200 font-medium transition-all cursor-pointer"
              >
                Luxembourg 🇱🇺
              </button>
              <button 
                onClick={() => { setSearchTerm('AI'); setSelectedMatchFilter('All'); setShowBookmarksOnly(false); }}
                className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1 rounded-full border border-slate-200 hover:border-indigo-200 font-medium transition-all cursor-pointer"
              >
                Artificial Intelligence 🤖
              </button>
              <button 
                onClick={() => { setSearchTerm('Finance'); setSelectedMatchFilter('All'); setShowBookmarksOnly(false); }}
                className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1 rounded-full border border-slate-200 hover:border-indigo-200 font-medium transition-all cursor-pointer"
              >
                Finance & Economics 📈
              </button>
              <button 
                onClick={() => { setSearchTerm('Pakistan'); setSelectedMatchFilter('All'); setShowBookmarksOnly(false); }}
                className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1 rounded-full border border-slate-200 hover:border-indigo-200 font-medium transition-all cursor-pointer"
              >
                Pakistani Open 🇵🇰
              </button>
            </div>

            {/* Sorting & Show Bookmarked toggle */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Show shortlisted toggle */}
              <button
                onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
                  showBookmarksOnly 
                    ? 'bg-amber-500/10 text-amber-700 border-amber-300' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                id="toggle-bookmarks-btn"
              >
                <Bookmark className={`w-3.5 h-3.5 ${showBookmarksOnly ? 'fill-amber-600 text-amber-600' : ''}`} />
                <span>Shortlist ({bookmarks.length})</span>
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-1">
                <span className="text-slate-400">Sort:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-slate-700 font-bold border-none outline-none focus:ring-0 cursor-pointer text-xs"
                  id="sort-select"
                >
                  <option value="deadline">Soonest Deadline</option>
                  <option value="name-asc">Alphabetical (A-Z)</option>
                  <option value="name-desc">Alphabetical (Z-A)</option>
                </select>
              </div>

              {/* Clear / Reset Filter Button */}
              {(searchTerm !== '' || selectedCategory !== 'All' || selectedField !== 'All' || selectedMatchFilter !== 'All' || selectedDuration !== 'All' || showBookmarksOnly) && (
                <button 
                  onClick={handleResetFilters}
                  className="text-rose-600 hover:text-rose-700 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                  id="reset-filters-btn"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              )}

              {/* Export Plan if Bookmarks Exist */}
              {bookmarks.length > 0 && (
                <button 
                  onClick={exportBookmarksAsJSON}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-full font-semibold flex items-center space-x-1.5 shadow-sm transition-all text-xs cursor-pointer"
                  id="export-bookmarks-btn"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Export ({bookmarks.length})</span>
                </button>
              )}

            </div>

          </div>

        </section>

        {/* Opportunities List Grid */}
        <div id="opportunities-grid-container">
          
          {filteredOpportunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="opportunities-grid">
              {filteredOpportunities.map((opp) => {
                const fieldTheme = getFieldTheme(opp.field);
                const isBookmarked = bookmarks.includes(opp.id);
                const matchTags = getMatchTypes(opp);
                const hasNotes = notes[opp.id] && notes[opp.id].trim().length > 0;

                return (
                  <motion.div
                    key={opp.id}
                    layoutId={`opp-card-${opp.id}`}
                    onClick={() => setActiveOpportunity(opp)}
                    className={`bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm cursor-pointer flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group ${fieldTheme.border}`}
                    id={`opp-card-${opp.id}`}
                  >
                    
                    {/* Top Meta info */}
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        
                        {/* Category Badge */}
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg flex items-center space-x-1 border border-slate-200/50">
                          {getCategoryIcon(opp.category)}
                          <span>{opp.category}</span>
                        </span>

                        {/* Actions (Bookmark) */}
                        <div className="flex items-center space-x-1.5">
                          {hasNotes && (
                            <span className="p-1 bg-indigo-50 text-indigo-600 rounded-md" title="Has local notes">
                              <NotebookTabs className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <button
                            onClick={(e) => toggleBookmark(opp.id, e)}
                            className={`p-1.5 rounded-full border transition-all ${
                              isBookmarked 
                                ? 'bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100' 
                                : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                            }`}
                            title={isBookmarked ? "Remove from shortlist" : "Add to shortlist"}
                            id={`bookmark-btn-${opp.id}`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                          </button>
                        </div>

                      </div>

                      {/* Header Host & Program Name */}
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">{opp.host}</p>
                      <h3 className="text-base font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {opp.name}
                      </h3>

                      {/* Match Highlights Badge list */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${fieldTheme.bg}`}>
                          {opp.field}
                        </span>

                        {matchTags.map((tag, idx) => {
                          let tagStyle = 'bg-slate-100 text-slate-600 border-slate-200';
                          if (tag === 'Luxembourg Local') {
                            tagStyle = 'bg-rose-50 text-rose-700 border-rose-100 font-semibold';
                          } else if (tag === 'Pakistani Eligible') {
                            tagStyle = 'bg-emerald-50 text-emerald-700 border-emerald-100 font-semibold';
                          } else if (tag === 'FinTech / AI Convergence') {
                            tagStyle = 'bg-indigo-50 text-indigo-700 border-indigo-100 font-semibold';
                          } else if (tag === 'Australia Focus') {
                            tagStyle = 'bg-sky-50 text-sky-700 border-sky-100 font-semibold';
                          }

                          return (
                            <span key={idx} className={`text-[10px] px-2 py-0.5 rounded-md border ${tagStyle}`}>
                              {tag}
                            </span>
                          );
                        })}
                      </div>

                    </div>

                    {/* Footer Info of Card */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      
                      {/* Deadline */}
                      <div className="flex items-center text-slate-500">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        <span>Deadline: <strong className="text-slate-700 font-bold">{formatDeadlineDate(opp.deadline)}</strong></span>
                      </div>

                      {/* Read More link indicator */}
                      <span className="text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center text-[11px] gap-0.5">
                        Details
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>

                    </div>

                  </motion.div>
                );
              })}
            </div>
          ) : (
            
            /* Empty State Container */
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 max-w-lg mx-auto shadow-sm mt-8" id="empty-state">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-100">
                <Search className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No matching opportunities found</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6 max-w-sm mx-auto">
                No active records matched your current query or filter combinations. Try refining your spelling, resetting criteria, or selecting "All Categories."
              </p>
              <button 
                onClick={handleResetFilters}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center space-x-1.5"
                id="empty-state-reset-btn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>

          )}

        </div>

      </main>

      {/* Detail Overlay Modal */}
      <AnimatePresence>
        {activeOpportunity && (
          <div 
            className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
            onClick={() => setActiveOpportunity(null)}
            id="details-modal-overlay"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col my-8"
              id="details-modal"
            >
              
              {/* Modal Banner Header */}
              <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-indigo-950"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_60%)] pointer-events-none"></div>
                
                <div className="relative z-10">
                  
                  {/* Close button */}
                  <button 
                    onClick={() => setActiveOpportunity(null)} 
                    className="absolute top-0 right-0 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-xl transition-all cursor-pointer"
                    aria-label="Close modal"
                    id="modal-close-btn"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="bg-indigo-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-md tracking-wider flex items-center space-x-1">
                      {getCategoryIcon(activeOpportunity.category)}
                      <span>{activeOpportunity.category}</span>
                    </span>
                    <span className="bg-slate-800 text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-700">
                      {activeOpportunity.field}
                    </span>
                    {bookmarks.includes(activeOpportunity.id) && (
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-amber-500/30 flex items-center space-x-1">
                        <Bookmark className="w-3 h-3 fill-amber-300" />
                        <span>Shortlisted</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold leading-snug pr-8" id="modal-title">
                    {activeOpportunity.name}
                  </h3>
                  <p className="text-slate-300 text-sm mt-1.5 font-medium" id="modal-host">
                    Host: {activeOpportunity.host}
                  </p>

                </div>
              </div>

              {/* Modal Content Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs md:text-sm max-h-[60vh] text-slate-700">
                
                {/* Meta details cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Application Deadline
                    </p>
                    <p className="font-bold text-slate-800" id="modal-deadline">
                      {formatDeadlineDate(activeOpportunity.deadline)}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Program Duration
                    </p>
                    <p className="font-bold text-slate-800" id="modal-duration">
                      {activeOpportunity.duration}
                    </p>
                  </div>
                </div>

                {/* Funding structure details */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-2 flex items-center">
                    <Coins className="w-4 h-4 mr-1" />
                    Funding Structure & Benefits
                  </p>
                  <div className="text-slate-800 bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl leading-relaxed text-xs font-medium" id="modal-funding">
                    {activeOpportunity.funding}
                  </div>
                </div>

                {/* Target eligibility parameters */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-1" />
                    Eligibility & Requirements
                  </p>
                  <p className="text-slate-700 bg-slate-50 border border-slate-100 p-4 rounded-2xl leading-relaxed text-xs" id="modal-eligibility">
                    {activeOpportunity.eligibility}
                  </p>
                </div>

                {/* Customized alignment description */}
                <div className="bg-indigo-50 border border-indigo-100/50 p-4 rounded-2xl flex items-start space-x-3.5">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                      Luxembourg Residency & Pakistani Passport Candidate Fit
                    </p>
                    <p className="text-indigo-950 font-medium text-xs leading-relaxed" id="modal-suitability">
                      {activeOpportunity.suitability}
                    </p>
                  </div>
                </div>

                {/* Personal Study & Application Notes */}
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center">
                    <NotebookTabs className="w-4 h-4 mr-1" />
                    My Local Planning Notes
                  </p>
                  <div className="space-y-2">
                    <textarea
                      placeholder="Add personal checklists, deadlines, essay drafts, or status logs for this program. Persists automatically in your browser."
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-700 placeholder:text-slate-400 transition-all min-h-[90px] resize-none"
                      id="modal-notes-textarea"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => saveNote(activeOpportunity.id)}
                        className="bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                        id="modal-save-notes-btn"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer actions */}
              <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-3">
                
                {/* Secondary bookmark in modal */}
                <button
                  onClick={(e) => toggleBookmark(activeOpportunity.id, e)}
                  className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    bookmarks.includes(activeOpportunity.id)
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  id="modal-bookmark-toggle-btn"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarks.includes(activeOpportunity.id) ? 'fill-amber-600 text-amber-600' : ''}`} />
                  <span>{bookmarks.includes(activeOpportunity.id) ? 'Shortlisted' : 'Add to Shortlist'}</span>
                </button>

                <div className="flex w-full md:w-auto gap-2.5">
                  <button 
                    onClick={() => setActiveOpportunity(null)} 
                    className="flex-1 md:flex-none px-4 py-2.5 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                    id="modal-cancel-btn"
                  >
                    Close Window
                  </button>
                  <a 
                    href={activeOpportunity.link} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    id="modal-apply-btn"
                  >
                    Apply on Official Website 
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
