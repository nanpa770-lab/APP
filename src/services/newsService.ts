import type { NewsArticle, NewsCategory, NewsFilter, NewsResponse } from '../types/news';

// ── 프록시 목록 (CORS 우회) ──────────────────────────────────
const PROXY_LIST = [
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.cors.lol/?url=${encodeURIComponent(url)}`,
];

// ── RSS 피드 소스 ────────────────────────────────────────────
export const RSS_SOURCES: Record<NewsCategory, string[]> = {
  politics: [
    'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNRFZ4ZERBU0FoSnJieWdBUAE?hl=ko&gl=KR&ceid=KR:ko',
  ],
  economy: [
    'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FoSnJieG9DUzFJb0FBUAE?hl=ko&gl=KR&ceid=KR:ko',
  ],
  society: [
    'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNRFp0Y1RjU0FoSnJieWdBUAE?hl=ko&gl=KR&ceid=KR:ko',
  ],
  world: [
    'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FoSnJieG9DUzFJb0FBUAE?hl=ko&gl=KR&ceid=KR:ko',
  ],
  tech: [
    'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FoSnJieG9DUzFJb0FBUAE?hl=ko&gl=KR&ceid=KR:ko',
  ],
  culture: [
    'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FoSnJieG9DUzFJb0FBUAE?hl=ko&gl=KR&ceid=KR:ko',
  ],
  sports: [
    'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FoSnJieG9DUzFJb0FBUAE?hl=ko&gl=KR&ceid=KR:ko',
  ],
};

// ── 카테고리 한글 레이블 ────────────────────────────────────
export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  politics: '정치',
  economy: '경제',
  society: '사회',
  world:   '세계',
  tech:    '기술',
  culture: '문화',
  sports:  '스포츠',
};

// ── 가장 빠른 프록시로 fetch ────────────────────────────────
let lastSuccessfulProxyIndex = 0;

const fetchWithFastestProxy = async (url: string): Promise<string> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const sortedProxies = [
    PROXY_LIST[lastSuccessfulProxyIndex],
    ...PROXY_LIST.filter((_, i) => i !== lastSuccessfulProxyIndex),
  ];

  try {
    const result = await Promise.any(
      sortedProxies.map(async (makeProxyUrl, index) => {
        const proxyUrl = makeProxyUrl(url);
        const res = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: { Accept: 'application/json, text/xml, application/xml, */*' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.text();
        let content: string;
        try {
          const json = JSON.parse(data);
          content = json.contents || json.data || data;
        } catch {
          content = data;
        }
        if (!content || content.length < 100) throw new Error('Empty response');
        const originalIndex = PROXY_LIST.indexOf(sortedProxies[index]);
        if (originalIndex !== -1) lastSuccessfulProxyIndex = originalIndex;
        return content;
      })
    );
    clearTimeout(timeout);
    return result;
  } catch (error) {
    clearTimeout(timeout);
    throw new Error(`모든 프록시 실패: ${error}`);
  }
};

// ── XML 파싱 유틸 ───────────────────────────────────────────
const getTagContent = (xml: string, tag: string): string => {
  const regex = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`
  );
  const match = xml.match(regex);
  return (match?.[1] || match?.[2] || '').trim();
};

const getAllItems = (xml: string): string[] => {
  const items: string[] = [];
  const regex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    items.push(match[0]);
  }
  return items;
};

const extractImageUrl = (itemXml: string): string | undefined => {
  const mediaMatch = itemXml.match(/url="([^"]+\.(jpg|jpeg|png|gif|webp)[^"]*)"/i);
  if (mediaMatch) return mediaMatch[1];
  const enclosureMatch = itemXml.match(/<enclosure[^>]+url="([^"]+)"[^>]+type="image/);
  if (enclosureMatch) return enclosureMatch[1];
  const imgMatch = itemXml.match(/<img[^>]+src="([^"]+)"/);
  if (imgMatch) return imgMatch[1];
  return undefined;
};

const generateId = (title: string, link: string): string => {
  const str = `${title}-${link}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

// ── RSS 피드 파싱 ───────────────────────────────────────────
const parseRSS = async (url: string, category: NewsCategory): Promise<NewsArticle[]> => {
  try {
    const xmlText = await fetchWithFastestProxy(url);
    const items = getAllItems(xmlText);
    return items.map((item): NewsArticle => {
      const title = getTagContent(item, 'title');
      const description = getTagContent(item, 'description')
        .replace(/<[^>]*>/g, '')
        .substring(0, 200);
      const link = getTagContent(item, 'link');
      const pubDate = getTagContent(item, 'pubDate');
      const source =
        getTagContent(item, 'source') ||
        (() => {
          try { return new URL(link || url).hostname; }
          catch { return 'unknown'; }
        })();
      const imageUrl = extractImageUrl(item);
      return { id: generateId(title, link), title, description, link, pubDate, category, source, imageUrl };
    });
  } catch (error) {
    console.error(`RSS 파싱 실패 [${category}]:`, error);
    return [];
  }
};

// ── 캐시 ────────────────────────────────────────────────────
interface CacheEntry { data: NewsArticle[]; timestamp: number; }
const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

// ── 메인 fetchNews ──────────────────────────────────────────
export const fetchNews = async (filter?: NewsFilter): Promise<NewsResponse> => {
  const categories: NewsCategory[] = filter?.category
    ? [filter.category]
    : ['politics', 'economy', 'society', 'world', 'tech', 'culture', 'sports'];
  const limit = filter?.limit || 50;
  const allArticles: NewsArticle[] = [];

  const promises = categories.flatMap((category) =>
    (RSS_SOURCES[category] || []).map(async (feedUrl) => {
      const cacheKey = `${category}-${feedUrl}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return cached.data;
      const articles = await parseRSS(feedUrl, category);
      cache.set(cacheKey, { data: articles, timestamp: Date.now() });
      return articles;
    })
  );

  const results = await Promise.allSettled(promises);
  results.forEach((r) => {
    if (r.status === 'fulfilled') allArticles.push(...r.value);
  });

  let filtered = allArticles;
  if (filter?.keyword) {
    const kw = filter.keyword.toLowerCase();
    filtered = allArticles.filter(
      (a) => a.title.toLowerCase().includes(kw) || a.description.toLowerCase().includes(kw)
    );
  }

  filtered.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  const limited = filtered.slice(0, limit);

  return { articles: limited, totalCount: limited.length, lastUpdated: new Date().toISOString() };
};
