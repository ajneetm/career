'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

function isOnLand(lat: number, lon: number): boolean {
  // North America
  if (lat > 25 && lat < 72 && lon > -140 && lon < -55) return true;
  // Central America
  if (lat > 8 && lat < 25 && lon > -92 && lon < -60) return true;
  // Greenland
  if (lat > 60 && lat < 84 && lon > -55 && lon < -18) return true;
  // South America
  if (lat > -55 && lat < 12 && lon > -82 && lon < -34) return true;
  // Europe
  if (lat > 36 && lat < 71 && lon > -10 && lon < 40) return true;
  // Africa
  if (lat > -35 && lat < 37 && lon > -18 && lon < 52) return true;
  // Middle East
  if (lat > 12 && lat < 42 && lon > 35 && lon < 65) return true;
  // Russia / North Asia
  if (lat > 50 && lat < 75 && lon > 40 && lon < 180) return true;
  // Central / South Asia
  if (lat > 5 && lat < 50 && lon > 60 && lon < 145) return true;
  // Southeast Asia
  if (lat > -10 && lat < 28 && lon > 95 && lon < 155) return true;
  // Australia
  if (lat > -45 && lat < -10 && lon > 113 && lon < 154) return true;
  // New Zealand
  if (lat > -47 && lat < -34 && lon > 166 && lon < 178) return true;
  // Japan
  if (lat > 31 && lat < 46 && lon > 130 && lon < 146) return true;
  // UK / Ireland
  if (lat > 50 && lat < 61 && lon > -11 && lon < 2) return true;
  // Iceland
  if (lat > 63 && lat < 67 && lon > -25 && lon < -13) return true;
  // Madagascar
  if (lat > -26 && lat < -12 && lon > 43 && lon < 51) return true;
  return false;
}

export function WorldMapBg() {
  const dots = useMemo(() => {
    const result: { x: number; y: number; color: string }[] = [];
    const W = 1000;
    const H = 480;
    const step = 11;

    const palette = ['#6366f1', '#818cf8', '#38bdf8', '#0ea5e9', '#a78bfa', '#34d399'];

    for (let lon = -180; lon < 180; lon += step * 0.36) {
      for (let lat = -85; lat < 85; lat += step * 0.18) {
        if (!isOnLand(lat, lon)) continue;
        const x = ((lon + 180) / 360) * W;
        const y = ((90 - lat) / 180) * H;
        const color = palette[Math.floor((x + y * 3) % palette.length)];
        result.push({ x, y, color });
      }
    }
    return result;
  }, []);

  return (
    <motion.div
      className="world-map-bg"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      <svg
        viewBox="0 0 1000 480"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="world-map-svg"
      >
        <defs>
          <radialGradient id="mapFade" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.88" />
          </radialGradient>
        </defs>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="2.2" fill={d.color} opacity="0.22" />
        ))}
        <rect width="1000" height="480" fill="url(#mapFade)" />
      </svg>
    </motion.div>
  );
}
