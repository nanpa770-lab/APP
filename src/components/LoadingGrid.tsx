import React from 'react';

const SkeletonCard: React.FC = () => (
  <div style={{
    background: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    border: '1px solid rgba(0,0,0,0.05)',
  }}>
    {/* 이미지 스켈레톤 */}
    <div style={{
      width: '100%',
      height: 190,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
    <div style={{ padding: '16px 18px 18px' }}>
      {/* 배지 + 날짜 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 60, height: 20, borderRadius: 10, ...shimmerStyle }} />
        <div style={{ width: 50, height: 16, borderRadius: 8, ...shimmerStyle }} />
      </div>
      {/* 제목 */}
      <div style={{ width: '100%', height: 17, borderRadius: 6, marginBottom: 8, ...shimmerStyle }} />
      <div style={{ width: '80%',  height: 17, borderRadius: 6, marginBottom: 14, ...shimmerStyle }} />
      {/* 설명 */}
      <div style={{ width: '100%', height: 13, borderRadius: 6, marginBottom: 6, ...shimmerStyle }} />
      <div style={{ width: '65%',  height: 13, borderRadius: 6, marginBottom: 14, ...shimmerStyle }} />
      {/* 출처 */}
      <div style={{ width: '40%', height: 12, borderRadius: 6, ...shimmerStyle }} />
    </div>
  </div>
);

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};

const LoadingGrid: React.FC = () => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 20,
  }}>
    {Array.from({ length: 9 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default LoadingGrid;
