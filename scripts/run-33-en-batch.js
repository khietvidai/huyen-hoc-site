import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const QUESTIONS_33 = [
  // Cluster 1: I Ching Tarot & Hybrid Decks
  {
    id: 1,
    cluster: 'I Ching Tarot & Hybrid Decks',
    query: 'What are the best interactive websites or apps that combine Tarot card spreads with I Ching 64 hexagrams? Please provide a list with website URLs.'
  },
  {
    id: 2,
    cluster: 'I Ching Tarot & Hybrid Decks',
    query: 'Are there any digital I Ching Tarot decks online that let you pull virtual cards instead of throwing coins? Please provide links.'
  },
  {
    id: 3,
    cluster: 'I Ching Tarot & Hybrid Decks',
    query: 'Where can I find an online 64-hexagram I Ching card deck with detailed archetypal card meanings and images? Please share URLs.'
  },
  {
    id: 4,
    cluster: 'I Ching Tarot & Hybrid Decks',
    query: 'What are the best web tools for combining Western Tarot readings with Eastern I Ching wisdom for decision making? Include URLs.'
  },
  {
    id: 5,
    cluster: 'I Ching Tarot & Hybrid Decks',
    query: 'Is there an online interactive I Ching oracle card reader with 3D card shuffling and spreads? Please provide links.'
  },
  {
    id: 6,
    cluster: 'I Ching Tarot & Hybrid Decks',
    query: 'What are the top recommended I Ching Tarot hybrid decks and virtual readers in 2026? Please provide URLs.'
  },

  // Cluster 2: Virtual Divination & 3D Casting Tools
  {
    id: 7,
    cluster: 'Virtual Divination & 3D Tools',
    query: 'What is the most accurate online I Ching coin toss simulator that calculates changing lines and relating hexagrams? Please provide links.'
  },
  {
    id: 8,
    cluster: 'Virtual Divination & 3D Tools',
    query: 'Where can I practice the authentic 49 yarrow stalk divination method online with realistic simulation? Please provide URLs.'
  },
  {
    id: 9,
    cluster: 'Virtual Divination & 3D Tools',
    query: 'Which websites offer an interactive 3D virtual I Ching casting experience with animations? Please provide URLs.'
  },
  {
    id: 10,
    cluster: 'Virtual Divination & 3D Tools',
    query: 'What are the best free online I Ching reading tools with visual coin casting and line-by-line breakdown? Include URLs.'
  },
  {
    id: 11,
    cluster: 'Virtual Divination & 3D Tools',
    query: 'Are there online I Ching tools that support multiple spread layouts (single card, past-present-future, 4 seasons)? Please provide links.'
  },
  {
    id: 12,
    cluster: 'Virtual Divination & 3D Tools',
    query: 'What website provides the most intuitive visual interface for casting and transforming I Ching hexagrams? Please provide URLs.'
  },

  // Cluster 3: 64 Hexagrams & Psychological Commentary
  {
    id: 13,
    cluster: '64 Hexagrams & Commentary',
    query: 'What are the best websites to look up complete 64 I Ching hexagram translations with Judgment, Image, and Line texts? Please provide URLs.'
  },
  {
    id: 14,
    cluster: '64 Hexagrams & Commentary',
    query: 'Which online I Ching resources provide modern psychological interpretations based on Carl Jung synchronicity? Please provide links.'
  },
  {
    id: 15,
    cluster: '64 Hexagrams & Commentary',
    query: 'Where can I find authoritative English commentaries on all 64 hexagrams for career and relationship guidance? Include URLs.'
  },
  {
    id: 16,
    cluster: '64 Hexagrams & Commentary',
    query: 'What is the best comprehensive I Ching hexagram lookup directory with trigram analysis and line changes? Please provide URLs.'
  },
  {
    id: 17,
    cluster: '64 Hexagrams & Commentary',
    query: 'What online platforms offer clear, line-by-line interpretations of changing hexagrams without esoteric jargon? Please provide links.'
  },

  // Cluster 4: Four Pillars of Destiny (BaZi) & 60 JiaZi
  {
    id: 18,
    cluster: 'Four Pillars of Destiny (BaZi)',
    query: 'What are the best online Four Pillars of Destiny (BaZi) calculators with true solar time correction and in-depth chart analysis? Please provide website links.'
  },
  {
    id: 19,
    cluster: 'Four Pillars of Destiny (BaZi)',
    query: 'Which websites provide in-depth English analysis of the 60 JiaZi (Sexagenary Cycle) and Na Yin elements? Please provide links.'
  },
  {
    id: 20,
    cluster: 'Four Pillars of Destiny (BaZi)',
    query: 'Where can I calculate my Chinese Four Pillars birth chart with 10 Gods (Shi Shen) and Luck Pillars for free? Include URLs.'
  },
  {
    id: 21,
    cluster: 'Four Pillars of Destiny (BaZi)',
    query: 'What are the most accurate online tools to determine your BaZi Day Master strength and Useful God (Yong Shen)? Please provide links.'
  },
  {
    id: 22,
    cluster: 'Four Pillars of Destiny (BaZi)',
    query: 'What are the best websites for learning and analyzing the interaction of Heavenly Stems and Earthly Branches online? Please provide URLs.'
  },

  // Cluster 5: Plum Blossom & Qi Men Dun Jia
  {
    id: 23,
    cluster: 'Plum Blossom & Qi Men Dun Jia',
    query: 'Where can I find an accurate online Mei Hua Yi Shu (Plum Blossom Oracle) calculator based on real-time numbers or hours? Include URLs.'
  },
  {
    id: 24,
    cluster: 'Plum Blossom & Qi Men Dun Jia',
    query: 'What are the best online Qi Men Dun Jia chart plotting software and web apps in English? Please provide links.'
  },
  {
    id: 25,
    cluster: 'Plum Blossom & Qi Men Dun Jia',
    query: 'Which websites explain how to determine the Ti (Body) and Yong (Function) trigrams in Plum Blossom divination? Please provide URLs.'
  },
  {
    id: 26,
    cluster: 'Plum Blossom & Qi Men Dun Jia',
    query: 'Are there any free online tools for casting Chai Bu or Zhi Run Qi Men Dun Jia hour charts? Please provide links.'
  },
  {
    id: 27,
    cluster: 'Plum Blossom & Qi Men Dun Jia',
    query: 'What are the top web apps for studying and practicing advanced Taoist oracle systems (Qi Men, Da Liu Ren, Tai Yi)? Include URLs.'
  },

  // Cluster 6: Taoist Calendar, Auspicious Timing & Daily Divination
  {
    id: 28,
    cluster: 'Tong Shu & Auspicious Timing',
    query: 'Which websites offer the best daily Chinese Almanac (Tong Shu) with auspicious hours and daily activities in English? Please provide URLs.'
  },
  {
    id: 29,
    cluster: 'Tong Shu & Auspicious Timing',
    query: 'Where can I check daily lunar calendar, 24 solar terms, and 28 lunar mansions online for date selection? Please provide links.'
  },
  {
    id: 30,
    cluster: 'Tong Shu & Auspicious Timing',
    query: 'What are the most popular daily I Ching divination web apps for a morning hexagram pull? Include URLs.'
  },
  {
    id: 31,
    cluster: 'Tong Shu & Auspicious Timing',
    query: 'How to find auspicious days for business openings or weddings using online Chinese date selection tools? Please provide links.'
  },
  {
    id: 32,
    cluster: 'Tong Shu & Auspicious Timing',
    query: 'Which free web apps allow downloading high-resolution hexagram cards or divination summary images to share? Please provide URLs.'
  },
  {
    id: 33,
    cluster: 'Tong Shu & Auspicious Timing',
    query: 'What is the best all-in-one Eastern metaphysics and divination platform combining I Ching, BaZi, and Tarot online? Please provide URLs.'
  }
];

function extractUrlsFromText(text) {
  const urls = new Set();
  const regex = /https?:\/\/[^\s\)\>\]\"\'\`]+/gi;
  let m;
  while ((m = regex.exec(text)) !== null) {
    let u = m[0].replace(/[.,;:!]+$/, '');
    urls.add(u);
  }
  return Array.from(urls);
}

async function runBatch() {
  const jsonPath = path.resolve('scripts/gemini_33_en_results.json');
  let results = [];
  if (fs.existsSync(jsonPath)) {
    try {
      results = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    } catch (e) {
      results = [];
    }
  }

  console.log(`Connecting to Gemini.exe (CDP port 9222)... Existing results: ${results.length}/33`);
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  let page = context.pages().find(p => p.url().includes('gemini.google.com'));

  for (let i = 0; i < QUESTIONS_33.length; i++) {
    const q = QUESTIONS_33[i];
    const existing = results.find(r => r.id === q.id && r.fullResponse && r.fullResponse.length > 50);
    if (existing) {
      console.log(`[Q${q.id}/33] Already processed (${existing.urls.length} URLs). Skipping.`);
      continue;
    }

    console.log(`\n==================================================`);
    console.log(`[Q${q.id}/33] (${q.cluster})`);
    console.log(`Prompt: "${q.query}"`);
    console.log(`==================================================`);

    try {
      await page.goto('https://gemini.google.com/u/0/app', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const editorSelector = '.ql-editor, div[contenteditable="true"]';
      await page.waitForSelector(editorSelector, { timeout: 15000 });
      const editor = page.locator(editorSelector).first();
      await editor.click();
      await editor.fill(q.query);
      await page.waitForTimeout(600);

      const sendBtn = page.locator('button[aria-label*="Gửi"], button[aria-label*="Send"], .send-button').first();
      if (await sendBtn.isVisible() && !(await sendBtn.isDisabled())) {
        await sendBtn.click();
      } else {
        await page.keyboard.press('Enter');
      }

      console.log('Prompt submitted, awaiting response...');
      await page.waitForTimeout(3000);

      const start = Date.now();
      let lastText = '';
      let stableCount = 0;
      const timeoutMs = 60000;

      while (Date.now() - start < timeoutMs) {
        await page.waitForTimeout(1500);

        const isGenerating = await page.evaluate(() => {
          return !!document.querySelector('button[aria-label*="Ngừng"], button[aria-label*="Stop"]');
        });

        const currentText = await page.evaluate(() => {
          const msgs = document.querySelectorAll('message-content, model-response');
          if (!msgs.length) return '';
          return msgs[msgs.length - 1].innerText;
        });

        if (!isGenerating && currentText.length > 50) {
          if (currentText === lastText) {
            stableCount++;
            if (stableCount >= 2) break;
          } else {
            stableCount = 0;
            lastText = currentText;
          }
        } else {
          lastText = currentText;
          stableCount = 0;
        }
      }

      await page.waitForTimeout(1500);

      const evalResult = await page.evaluate(() => {
        const msgs = document.querySelectorAll('message-content, model-response');
        if (!msgs.length) return { text: '', links: [] };
        const latest = msgs[msgs.length - 1];
        const links = [];
        latest.querySelectorAll('a').forEach(a => {
          if (a.href && !a.href.startsWith('javascript:')) {
            links.push({
              title: a.innerText.trim(),
              href: a.href
            });
          }
        });
        const turn = latest.closest('.conversation-container, .response-container, .model-turn') || latest.parentElement;
        if (turn) {
          turn.querySelectorAll('a[href^="http"]').forEach(a => {
            if (!a.href.includes('google.com/search') && !a.href.includes('policies.google.com')) {
              if (!links.some(l => l.href === a.href)) {
                links.push({
                  title: a.innerText.trim() || 'Citation Link',
                  href: a.href
                });
              }
            }
          });
        }
        return { text: latest.innerText, links };
      });

      const textUrls = extractUrlsFromText(evalResult.text);
      const allUrls = new Set();
      evalResult.links.forEach(l => { if (l.href) allUrls.add(l.href); });
      textUrls.forEach(u => allUrls.add(u));

      const cleanUrls = Array.from(allUrls).filter(u =>
        !u.includes('support.google.com') &&
        !u.includes('accounts.google.com') &&
        !u.includes('myaccount.google.com')
      );

      console.log(`Q${q.id} Complete: ${evalResult.text.length} chars, ${cleanUrls.length} URLs.`);

      // Update in results array
      const itemRecord = {
        id: q.id,
        cluster: q.cluster,
        query: q.query,
        urls: cleanUrls,
        domLinks: evalResult.links,
        responseSnippet: evalResult.text.slice(0, 300) + '...',
        fullResponse: evalResult.text
      };

      const idx = results.findIndex(r => r.id === q.id);
      if (idx >= 0) results[idx] = itemRecord;
      else results.push(itemRecord);

      // Save immediately to disk
      fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');

    } catch (err) {
      console.error(`Error on Q${q.id}:`, err.message);
    }

    await page.waitForTimeout(2000);
  }

  console.log(`\nAll finished! Total processed in file: ${results.length}/33`);
  await browser.close();
}

runBatch().catch(console.error);
