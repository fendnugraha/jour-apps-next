/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: true,
    env: {
        APP_VERSION: process.env.npm_package_version,
    },
};

export default nextConfig;
