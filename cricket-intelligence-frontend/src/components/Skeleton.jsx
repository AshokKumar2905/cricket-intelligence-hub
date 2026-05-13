import React from 'react';

/**
 * Global Skeleton base component with shimmer animation.
 * Optimized for the Premium Deep-Blue theme.
 */
export function Skeleton({ width = "100%", height = 20, radius = 4, style = {} }) {
  return (
    <div 
      className="shimmer-effect"
      style={{
        width,
        height,
        borderRadius: radius,
        /* Matches var(--icc-blue) and var(--icc-blue-light) from your app.py theme */
        background: "linear-gradient(90deg, #00195a 25%, #0a2774 50%, #00195a 75%)",
        backgroundSize: "200% 100%",
        display: 'block',
        ...style
      }} 
    />
  );
}

/**
 * Avatar Skeleton: Used in PlayerDetail.jsx and Roster view.
 */
export function CircleSkeleton({ size = 120, style = {} }) {
  return (
    <div style={{ padding: '10px', background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)' }}>
        <Skeleton 
            width={size} 
            height={size} 
            radius="50%" 
            style={{ border: '2px solid rgba(233, 16, 82, 0.2)', ...style }} 
        />
    </div>
  );
}

/**
 * Card Skeleton: Designed for Dashboard and Fixture cards.
 * Matches the layout of your new glassCardStyle.
 */
export function CardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} style={skeletonCardContainer} className="page-fade-in">
          {/* Header Identity Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
             <Skeleton height={12} width="30%" style={{ background: "rgba(56, 189, 248, 0.2)" }} />
             <Skeleton height={12} width="15%" style={{ opacity: 0.3 }} />
          </div>
          
          {/* Main Content Node */}
          <Skeleton height={40} width="60%" style={{ marginBottom: "20px" }} />
          
          {/* Multi-Metric Grid (Batting/Bowling/Fielding) */}
          <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} height={60} radius={2} style={{ flex: 1, opacity: 0.4 }} />
            ))}
          </div>
          
          {/* Action Button Placeholder */}
          <Skeleton height={35} width="100%" radius={2} style={{ opacity: 0.1 }} />
        </div>
      ))}
    </>
  );
}

/**
 * Table Skeleton: Specifically for the Dashboard Leaderboards.
 */
export function TableSkeleton({ rows = 6 }) {
  return (
    <div style={skeletonTableContainer}>
      {/* Table Header Placeholder */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px", borderBottom: '2px solid rgba(233, 16, 82, 0.2)', paddingBottom: '15px' }}>
        <Skeleton height={15} width="40%" />
        <Skeleton height={15} width="20%" />
        <Skeleton height={15} width="10%" />
        <Skeleton height={15} width="10%" />
      </div>

      {/* Zebra Striped Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
             <Skeleton 
                height={48} 
                radius={2} 
                style={{ 
                    width: '100%',
                    opacity: 1 - (i * 0.12),
                    background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)"
                }} 
            />
        </div>
      ))}
    </div>
  );
}

/* ================= THEMED STYLES ================= */

const skeletonCardContainer = { 
  background: "#00195a", 
  padding: "30px", 
  borderRadius: "8px", 
  marginBottom: "25px",
  border: "1px solid rgba(255,255,255,0.05)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
};

const skeletonTableContainer = { 
  background: "#00195a", 
  padding: "30px", 
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.05)" 
};