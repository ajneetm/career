'use client';

import { useMemo } from 'react';

export function GlobeBg() {
  const dots = useMemo(() => {
    const R = 210;
    const result: { x: number; y: number; op: number; r: number }[] = [];

    for (let lat = -84; lat <= 84; lat += 13) {
      for (let lon = -180; lon < 180; lon += 13) {
        const φ = (lat * Math.PI) / 180;
        const λ = (lon * Math.PI) / 180;

        const x3 = R * Math.cos(φ) * Math.cos(λ);
        const y3 = R * Math.sin(φ);
        const z3 = R * Math.cos(φ) * Math.sin(λ);

        // slight Y-axis rotation so it doesn't look front-on
        const a = (18 * Math.PI) / 180;
        const xr = x3 * Math.cos(a) + z3 * Math.sin(a);
        const zr = -x3 * Math.sin(a) + z3 * Math.cos(a);

        if (zr < -R * 0.18) continue;

        const depth = (zr + R) / (2 * R);
        result.push({ x: xr, y: -y3, op: 0.07 + depth * 0.38, r: 1.4 + depth * 1.5 });
      }
    }
    return result;
  }, []);

  return (
    <svg viewBox="-320 -320 780 640" className="globe-bg" aria-hidden="true">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#94a3b8" opacity={d.op} />
      ))}

      {/* decorative curves extending from globe */}
      <path d="M 198,55 C 270,10 330,-50 390,-115"
        stroke="#cbd5e1" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.65" />
      <circle cx="392" cy="-117" r="5" fill="#94a3b8" opacity="0.55" />

      <path d="M 175,-115 C 255,-160 325,-170 390,-140"
        stroke="#cbd5e1" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.65" />
      <circle cx="392" cy="-142" r="5" fill="#94a3b8" opacity="0.55" />

      <path d="M 190,140 C 265,185 330,198 400,178"
        stroke="#cbd5e1" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.65" />
      <circle cx="402" cy="176" r="5" fill="#94a3b8" opacity="0.55" />

      <path d="M 205,10 C 290,30 360,20 430,40"
        stroke="#cbd5e1" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.4" />
      <circle cx="432" cy="40" r="3.5" fill="#94a3b8" opacity="0.4" />
    </svg>
  );
}
