import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // هذا السطر هو الأهم
  images: {
    unoptimized: true, // ضروري لأن Next.js Image لا يعمل ستاتيك بدون خادم
  },
};

export default nextConfig;
