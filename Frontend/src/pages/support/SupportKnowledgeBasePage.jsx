import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Copy,
  Check,
  Shield,
  FileText,
  HelpCircle,
  FolderOpen,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { supportService } from '../../services/supportService';

const SupportKnowledgeBasePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    supportService.getKnowledgeBase()
      .then((data) => setArticles(data || []))
      .catch((err) => console.error('Error loading KB:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (snippet, id) => {
    navigator.clipboard.writeText(snippet);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ['All', 'Verification', 'Casting & Applications', 'Payments & Billing', 'Account & Security'];

  const filteredArticles = articles.filter((art) => {
    const matchCat = selectedCategory === 'All' || art.category === selectedCategory;
    const matchSearch =
      !search ||
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.summary.toLowerCase().includes(search.toLowerCase()) ||
      art.content.toLowerCase().includes(search.toLowerCase()) ||
      (art.canned_responses || []).some((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.snippet.toLowerCase().includes(search.toLowerCase())
      );
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Knowledge Base & Canned Snippets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Standard operating procedures, resolution policies, and authorized response templates.
          </p>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles, keywords, or canned answers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-sm">
          Loading knowledge articles...
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="p-16 bg-white rounded-2xl border border-slate-200/80 text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-900">No articles matched your query</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/50">
                  {art.category}
                </span>
                <h3 className="text-base font-bold text-slate-900">{art.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{art.content}</p>
              </div>

              {/* Canned Snippets */}
              {(art.canned_responses || []).length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Canned Responses
                  </div>
                  <div className="space-y-2">
                    {art.canned_responses.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-800">{c.title}</span>
                          <p className="text-slate-500 text-[11px] leading-snug">"{c.snippet}"</p>
                        </div>
                        <button
                          onClick={() => handleCopy(c.snippet, c.id)}
                          className="shrink-0 p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                          title="Copy to clipboard"
                        >
                          {copiedId === c.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportKnowledgeBasePage;

