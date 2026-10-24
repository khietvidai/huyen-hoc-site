import fs from 'fs';
import path from 'path';

export function buildHtmlReport() {
  const jsonPath = path.resolve('scripts/gemini_33_en_results.json');
  let data = [];
  if (fs.existsSync(jsonPath)) {
    try {
      data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    } catch (e) {
      data = [];
    }
  }

  // Count stats
  const totalQuestions = 33;
  const processedCount = data.length;
  const allUrls = new Set();
  const domainMap = new Map();

  data.forEach(item => {
    (item.urls || []).forEach(u => {
      try {
        const parsed = new URL(u);
        const host = parsed.hostname.replace(/^www\./, '');
        allUrls.add(u);
        domainMap.set(host, (domainMap.get(host) || 0) + 1);
      } catch (e) {}
    });
  });

  const sortedDomains = Array.from(domainMap.entries()).sort((a, b) => b[1] - a[1]);

  const clusterGroups = {
    'I Ching Tarot & Hybrid Decks': [],
    'Virtual Divination & 3D Tools': [],
    '64 Hexagrams & Commentary': [],
    'Four Pillars of Destiny (BaZi)': [],
    'Plum Blossom & Qi Men Dun Jia': [],
    'Tong Shu & Auspicious Timing': []
  };

  data.forEach(item => {
    if (clusterGroups[item.cluster]) {
      clusterGroups[item.cluster].push(item);
    }
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Global GEO Audit: 33 I Ching & Tarot Queries on Google Gemini AI</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    :root {
      --bg: #0b1120;
      --card-bg: #1e293b;
      --card-border: #334155;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #38bdf8;
      --accent: #f59e0b;
      --success: #10b981;
    }
    body {
      background-color: var(--bg);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .badge-cluster { background-color: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
    .badge-metric { background-color: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
  </style>
</head>
<body class="p-4 md:p-8 antialiased">
  <div class="max-w-6xl mx-auto space-y-6">

    <!-- Header -->
    <header class="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-xl">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold badge-cluster mb-2">
            <span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            English Global Market GEO Benchmark
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-white tracking-tight">
            🌐 Google Gemini AI Mention Audit: 33 Key English Queries
          </h1>
          <p class="text-slate-400 text-sm mt-1">
            Comprehensive survey of AI grounding citations across international I Ching, Tarot, BaZi & Taoist Metaphysics niches.
          </p>
        </div>
        <div class="flex flex-col items-end text-xs text-slate-400 space-y-1">
          <div class="bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            Source Engine: <span class="text-sky-300 font-mono font-bold">Gemini.exe (Desktop CDP)</span>
          </div>
          <div class="bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            Date: <span class="text-slate-200">October 2026</span>
          </div>
        </div>
      </div>

      <!-- Metrics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div class="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4">
          <div class="text-xs text-slate-400 font-medium">Audited Queries</div>
          <div class="text-2xl font-bold text-white mt-1">${processedCount} / ${totalQuestions}</div>
          <div class="text-[12px] text-sky-400 mt-1">6 Strategic Clusters</div>
        </div>
        <div class="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4">
          <div class="text-xs text-slate-400 font-medium">Distinct URLs Cited</div>
          <div class="text-2xl font-bold text-emerald-400 mt-1">${allUrls.size}</div>
          <div class="text-[12px] text-slate-400 mt-1">Across global search index</div>
        </div>
        <div class="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4">
          <div class="text-xs text-slate-400 font-medium">Unique Root Domains</div>
          <div class="text-2xl font-bold text-sky-400 mt-1">${domainMap.size}</div>
          <div class="text-[12px] text-slate-400 mt-1">US, Europe, Asia-Pacific</div>
        </div>
        <div class="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4">
          <div class="text-xs text-slate-400 font-medium">IChingTarot Mention</div>
          <div class="text-2xl font-bold text-amber-400 mt-1">0%</div>
          <div class="text-[12px] text-amber-300/80 mt-1">Blue Ocean Opportunity</div>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-sm">
      <button onclick="switchTab('tab-all')" id="btn-all" class="tab-btn px-4 py-2 rounded-lg font-medium transition bg-sky-500 text-white">
        📋 All 33 Queries & Results
      </button>
      <button onclick="switchTab('tab-domains')" id="btn-domains" class="tab-btn px-4 py-2 rounded-lg font-medium transition text-slate-400 hover:text-white hover:bg-slate-800">
        🏆 Top Cited Global Domains
      </button>
      <button onclick="switchTab('tab-geo')" id="btn-geo" class="tab-btn px-4 py-2 rounded-lg font-medium transition text-slate-400 hover:text-white hover:bg-slate-800">
        🚀 Global GEO Playbook for IChingTarot
      </button>
    </div>

    <!-- TAB 1: ALL 33 QUERIES -->
    <section id="tab-all" class="space-y-6">
      ${Object.keys(clusterGroups).map((clusterName, cIdx) => {
        const items = clusterGroups[clusterName];
        if (!items.length) return '';
        return `
        <div class="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-md">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3 mb-4">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 font-bold text-sm">${cIdx + 1}</span>
              <h2 class="text-lg font-bold text-white">${clusterName}</h2>
            </div>
            <span class="text-xs badge-cluster px-3 py-1 rounded-full font-medium">${items.length} Queries Evaluated</span>
          </div>

          <div class="space-y-4">
            ${items.map(item => `
              <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
                <div class="flex items-start justify-between gap-3">
                  <div class="font-semibold text-sky-300 text-sm">#${item.id}. "${item.query}"</div>
                  <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono flex-shrink-0">${(item.urls || []).length} URLs</span>
                </div>

                <!-- Answer snippet -->
                <p class="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 italic">
                  ${item.responseSnippet || 'Analyzing...'}
                </p>

                <!-- URLs -->
                ${(item.urls && item.urls.length) ? `
                  <div class="mt-3">
                    <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Cited URLs:</div>
                    <div class="flex flex-wrap gap-1.5">
                      ${item.urls.map(u => `
                        <a href="${u}" target="_blank" rel="noopener" class="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700 hover:border-sky-500/40 transition truncate max-w-md">
                          🔗 ${u}
                        </a>
                      `).join('')}
                    </div>
                  </div>
                ` : '<div class="text-xs text-slate-500 mt-2">No specific URLs mentioned.</div>'}
              </div>
            `).join('')}
          </div>
        </div>
        `;
      }).join('')}
    </section>

    <!-- TAB 2: DOMAIN RANKINGS -->
    <section id="tab-domains" class="hidden space-y-4">
      <div class="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-md">
        <h2 class="text-lg font-bold text-white mb-2">Most Frequently Cited Global Domains on Gemini AI</h2>
        <p class="text-xs text-slate-400 mb-4">Domains with the highest share of voice across all 33 queries.</p>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-300">
            <thead class="text-xs uppercase bg-slate-900/80 text-slate-400 border-b border-slate-700">
              <tr>
                <th class="px-4 py-3">Rank</th>
                <th class="px-4 py-3">Domain</th>
                <th class="px-4 py-3 text-center">Citation Frequency</th>
                <th class="px-4 py-3">Key Niche Coverage</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              ${sortedDomains.slice(0, 15).map(([dom, count], idx) => `
                <tr class="hover:bg-slate-700/30 transition">
                  <td class="px-4 py-3 font-mono text-slate-400">#${idx + 1}</td>
                  <td class="px-4 py-3 font-medium text-sky-300">${dom}</td>
                  <td class="px-4 py-3 text-center font-bold text-emerald-400">${count} times</td>
                  <td class="px-4 py-3 text-xs text-slate-400">I Ching, Tarot, BaZi calculations & commentaries</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 3: GEO PLAYBOOK -->
    <section id="tab-geo" class="hidden space-y-6">
      <div class="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-md">
        <h2 class="text-xl font-bold text-white mb-2">Global GEO Playbook: How IChingTarot Can Capture #1 AI Mentions</h2>
        <p class="text-sm text-slate-400 mb-6">Strategic action plan for dominating AI search results on Gemini, ChatGPT Search & Perplexity.</p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-5 rounded-xl bg-slate-900/60 border border-slate-700/70">
            <div class="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold mb-3">1</div>
            <h3 class="text-base font-bold text-white">English Subpath & Metadata</h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              Create an English landing page (e.g. <code class="text-sky-300">/en/iching-tarot</code>) with schema markup for <code class="text-purple-300">WebApplication</code>, emphasizing "3D Interactive 64-Hexagram Card Shuffler and Divination Suite".
            </p>
          </div>

          <div class="p-5 rounded-xl bg-slate-900/60 border border-slate-700/70">
            <div class="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-3">2</div>
            <h3 class="text-base font-bold text-white">Target Reddit Subreddits</h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              Gemini indexes Reddit discussions heavily. Seed authentic discussions in <code class="text-sky-300">r/tarot</code>, <code class="text-sky-300">r/TarotDecks</code>, and <code class="text-sky-300">r/iching</code> showcasing the 3D card layout and 49 yarrow stalk simulation.
            </p>
          </div>

          <div class="p-5 rounded-xl bg-slate-900/60 border border-slate-700/70">
            <div class="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-3">3</div>
            <h3 class="text-base font-bold text-white">Authentic Probability Badge</h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              Highlight the mathematical exactness of the 49 Da Yan yarrow stalks method (1/16, 3/16, 5/16, 7/16). Serious practitioners on international forums value this above all else.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="text-center text-xs text-slate-500 py-4 border-t border-slate-800">
      Antigravity Live GEO Audit • Powered by Google Gemini Desktop Client Engine.
    </footer>

  </div>

  <script>
    function switchTab(tabId) {
      document.getElementById('tab-all').classList.add('hidden');
      document.getElementById('tab-domains').classList.add('hidden');
      document.getElementById('tab-geo').classList.add('hidden');

      document.getElementById('btn-all').className = 'tab-btn px-4 py-2 rounded-lg font-medium transition text-slate-400 hover:text-white hover:bg-slate-800';
      document.getElementById('btn-domains').className = 'tab-btn px-4 py-2 rounded-lg font-medium transition text-slate-400 hover:text-white hover:bg-slate-800';
      document.getElementById('btn-geo').className = 'tab-btn px-4 py-2 rounded-lg font-medium transition text-slate-400 hover:text-white hover:bg-slate-800';

      document.getElementById(tabId).classList.remove('hidden');

      if (tabId === 'tab-all') {
        document.getElementById('btn-all').className = 'tab-btn px-4 py-2 rounded-lg font-medium transition bg-sky-500 text-white';
      } else if (tabId === 'tab-domains') {
        document.getElementById('btn-domains').className = 'tab-btn px-4 py-2 rounded-lg font-medium transition bg-sky-500 text-white';
      } else if (tabId === 'tab-geo') {
        document.getElementById('btn-geo').className = 'tab-btn px-4 py-2 rounded-lg font-medium transition bg-sky-500 text-white';
      }
    }
  </script>
</body>
</html>`;

  const reportPath = path.resolve('gemini_33_en_report.html');
  fs.writeFileSync(reportPath, html, 'utf-8');
  console.log(`Report updated at: ${reportPath}`);
  return html;
}

if (process.argv[1].endsWith('generate_html_report.js')) {
  buildHtmlReport();
}
