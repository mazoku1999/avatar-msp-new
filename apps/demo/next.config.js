import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
    experimental: {
        externalDir: true,
    },
    webpack: (config) => {
        config.resolve = config.resolve || {};
        config.resolve.alias = {
            ...(config.resolve.alias ?? {}),
            "@heygen/liveavatar-web-sdk": path.resolve(
                __dirname,
                "../../packages/js-sdk/src",
            ),
        };
        return config;
    },
};

export default nextConfig;
