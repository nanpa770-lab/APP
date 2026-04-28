import React from 'react';
import type { NewsCategory } from '../types/news';
import { CATEGORY_LABELS } from '../services/newsService';

interface HeaderProps {
  selectedCategory: NewsCategory | 'all';
  onCategoryChange: (cat: NewsCategory | 'all') => void;
  keyword: string;
  onKeywordChange: (kw: string) => void;
  onSearch: () => void;
  onRefresh: () => void;
  loading: boolean;
  lastUpdated: string;
}

const allCategories: { key: NewsCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all',      label: '전체',   icon: '🗞️' },
  { key: 'politics', label: '정치',   icon: '🏛️' },
  { key: 'economy',  label: '경제',   icon: '📈' },
  { key: 'society',  label: '사회',   icon: '👥' },
  { key: 'world',    label: '세계',   icon: '🌍' },
  { key: 'tech',     label: '기술',   icon: '💻' },
  { key: 'culture',  label: '문화',   icon: '🎭' },
  { key: 'sports',   label: '스포츠', icon: '⚽' },
];

// 카테고리별 배지 색상
export const CATEGORY_COLORS: Record<NewsCategory, { bg: string; text: string }> = {
  politics: { bg: '#fff0f0', text: '#c0392b' },
  economy:  { bg: '#fff8e1', text: '#d68910' },
  society:  { bg: '#f0fff4', text: '#1e8449' },
  world:    { bg: '#eaf6ff', text: '#1a6fa0' },
  tech:     { bg: '#f3e8ff', text: '#6c3483' },
  culture:  { bg: '#fff0fb', text: '#a04080' },
  sports:   { bg: '#e8f8f5', text: '#117a65' },
};

const Header: React.FC<HeaderProps> = ({
  selectedCategory,
  onCategoryChange,
  keyword,
  onKeywordChange,
  onSearch,
  onRefresh,
  loading,
  lastUpdated,
}) => {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      padding: '20px 0 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

        {/* 타이틀 + 새로고침 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 32 }}>📰</span>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>
                뉴스 허브
              </h1>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.5, letterSpacing: 1 }}>
                REAL-TIME KOREAN NEWS
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {lastUpdated && (
              <span style={{ fontSize: 12, opacity: 0.6 }}>
                🕐 {lastUpdated}
              </span>
            )}
            <button
              onClick={onRefresh}
              disabled={loading}
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                border: 'none',
                background: loading ? 'rgba(255,255,255,0.15)' : '#e94560',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 700,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{
                display: 'inline-block',
                animation: loading ? 'spin 1s linear infinite' : 'none',
              }}>🔄</span>
              {loading ? '로딩 중...' : '새로고침'}
            </button>
          </div>
        </div>

        {/* 검색창 */}
        <div style={{ marginBottom: 14, position: 'relative', maxWidth: 460 }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%',
            transform: 'translateY(-50%)', fontSize: 16, opacity: 0.5,
          }}>🔍</span>
          <input
            type="text"
            placeholder="키워드로 뉴스 검색..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            style={{
              width: '100%',
              padding: '11px 16px 11px 42px',
              borderRadius: 12,
              border: '2px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
              backdropFilter: 'blur(8px)',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(233,69,96,0.7)')}
            onBlur={(e)  => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
          />
        </div>

        {/* 카테고리 탭 */}
        <div style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 12,
          scrollbarWidth: 'none',
        }}>
          {allCategories.map((cat) => {
            const active = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => onCategoryChange(cat.key)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 20,
                  border: active ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  background: active ? '#e94560' : 'transparent',
                  color: active ? 'white' : 'rgba(255,255,255,0.75)',
                  transform: active ? 'scale(1.05)' : 'scale(1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export { allCategories, CATEGORY_LABELS };
export default Header;
