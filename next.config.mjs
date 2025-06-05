/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['heic-convert', 'sharp'],
        outputFileTracingIncludes: {
            '/api/**/*': ['./node_modules/**/*.wasm', './node_modules/**/*.proto']
        }
    }
};

export default nextConfig;
