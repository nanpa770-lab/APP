import React, { useState } from 'react';
import type { NewsArticle } from '../types/news';
import { CATEGORY_LABELS } from '../services/newsService';
import { CATEGORY_COLORS } from './Header';

interface ArticleCardProps {
  article: NewsArticle;
  formatDate: (dateStr: string) => string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, formatDate }) => {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const color = CATEGORY_COLORS[article.category];

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: hovered
          ? '0 12px 32px rgba(0,0,0,0.16)'
          : '0 2px 10px rgba(0,0,0,0.07)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 썸네일 이미지 */}
      {article.imageUrl && !imgError ? (
        <div style={{
          width: '100%',
          height: 190,
          overflow: 'hidden',
          backgroundColor: '#f0f0f0',
          flexShrink: 0,
        }}>
          <img
            src={article.imageUrl}
            alt={article.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        /* 이미지 없을 때 플레이스홀더 */
        <div style={{
          width: '100%',
          height: 80,
          background: `linear-gradient(135deg, ${color.bg}, #ffffff)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          flexShrink: 0,
        }}>
          {getCategoryIcon(article.category)}
        </div>
      )}

      {/* 카드 본문 */}
      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* 카테고리 배지 + 시간 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}>
          <span style={{
            padding: '3px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            background: color.bg,
            color: color.text,
            letterSpacing: 0.3,
          }}>
            {CATEGORY_LABELS[article.category]}
          </span>
          <span style={{ fontSize: 11, color: '#b0b0b0' }}>
            {formatDate(article.pubDate)}
          </span>
        </div>

        {/* 제목 */}
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: 15,
          fontWeight: 700,
          lineHeight: 1.45,
          color: '#1a1a2e',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {article.title}
        </h3>

        {/* 설명 */}
        {article.description && (
          <p style={{
            margin: '0 0 auto',
            paddingBottom: 12,
            fontSize: 13,
            color: '#666',
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {article.description}
          </p>
        )}

        {/* 출처 */}
        <div style={{
          paddingTop: 12,
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: article.description ? 0 : 'auto',
        }}>
          <span style={{ fontSize: 11, color: '#aaa' }}>📡</span>
          <span style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>
            {article.source}
          </span>
        </div>
      </div>
    </a>
  );
};

function getCategoryIcon(cat: string): string {
  const map: Record<string, string> = {
    politics: '🏛️', economy: '📈', society: '👥',
    world: '🌍', tech: '💻', culture: '🎭', sports: '⚽',
  };
  return map[cat] ?? '📰';
}

export default ArticleCard;
