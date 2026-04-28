import React, { useState, useEffect, useCallback } from 'react';
import type { NewsArticle, NewsCategory, NewsFilter } from './types/news';
import { fetchNews } from './services/newsService';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';
import LoadingGrid from './components/LoadingGrid';

const App: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState('');

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filter: NewsFilter = { limit: 60 };
      if (selectedCategory !== 'all') filter.category = selectedCategory;
      if (keyword.trim()) filter.keyword = keyword.trim();
      const response = await fetchNews(filter);
      setArticles(response.articles);
      setLastUpdated(new Date(response.lastUpdated).toLocaleString('ko-KR'));
    } catch {
      setError('뉴스를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, keyword]);

  // 카테고리/키워드 변경 시 즉시 로드
  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // 5분마다 자동 새로고침
  useEffect(() => {
    const timer = setInterval(loadNews, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [loadNews]);

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1)  return '방금 전';
      if (minutes < 60) return `${minutes}분 전`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24)   return `${hours}시간 전`;
      const days = Math.floor(hours / 24);
      if (days < 7)     return `${days}일 전`;
      return date.toLocaleDateString('ko-KR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f4f6f9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif',
    }}>
      {/* ── 헤더 ── */}
      <Header
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => setSelectedCategory(cat)}
        keyword={keyword}
        onKeywordChange={setKeyword}
        onSearch={loadNews}
        onRefresh={loadNews}
        loading={loading}
        lastUpdated={lastUpdated}
      />

      {/* ── 메인 콘텐츠 ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 60px' }}>

        {/* 에러 배너 */}
        {error && (
          <div style={{
            padding: '16px 20px',
            background: '#fff0f0',
            borderRadius: 12,
            marginBottom: 24,
            color: '#c0392b',
            fontWeight: 600,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid #ffc9c9',
          }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            {error}
            <button
              onClick={loadNews}
              style={{
                marginLeft: 'auto',
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                background: '#e94560',
                color: 'white',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              재시도
            </button>
          </div>
        )}

        {/* 로딩 중 - 스켈레톤 */}
        {loading && articles.length === 0 && <LoadingGrid />}

        {/* 결과 없음 */}
        {!loading && articles.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#999',
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#555' }}>
              검색 결과가 없습니다
            </p>
            <p style={{ fontSize: 14 }}>다른 키워드나 카테고리를 선택해보세요.</p>
          </div>
        )}

        {/* 기사 그리드 */}
        {articles.length > 0 && (
          <>
            {/* 결과 수 표시 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <p style={{ margin: 0, fontSize: 14, color: '#888' }}>
                총{' '}
                <strong style={{ color: '#1a1a2e', fontSize: 15 }}>
                  {articles.length}
                </strong>
                개 기사
                {loading && (
                  <span style={{ marginLeft: 8, fontSize: 12, color: '#e94560' }}>
                    업데이트 중...
                  </span>
                )}
              </p>
            </div>

            {/* 카드 그리드 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 22,
            }}>
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── 푸터 ── */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 20px',
        color: '#aaa',
        fontSize: 13,
        borderTop: '1px solid #e8e8e8',
        background: 'white',
      }}>
        📰 뉴스 허브 &nbsp;—&nbsp; Google News RSS 기반 실시간 한국 뉴스
        &nbsp;·&nbsp; 5분마다 자동 갱신
      </footer>

      {/* ── 전역 스타일 ── */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { height: 4px; width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
        input::placeholder { color: rgba(255,255,255,0.45); }
      `}</style>
    </div>
  );
};

export default App;
