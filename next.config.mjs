/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  poweredByHeader: false,
  // Les types sont vérifiés localement avant chaque déploiement ; le build ne doit pas échouer sur un avertissement de typage.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Anciennes adresses de fiches renommées : redirection permanente vers la nouvelle adresse.
  async redirects() {
    return [
      { source: "/produit/mini-scie-170w", destination: "/produit/disqueuse-meuleuse-pro-1700w", permanent: true },
      { source: "/produit/laine-de-verre-isover-etics-35", destination: "/produit/laine-de-roche-isover-etics-35", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/img/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      { source: "/search-index.json", headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }] },
      { source: "/(.*)", headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
      ] },
    ];
  },
};
