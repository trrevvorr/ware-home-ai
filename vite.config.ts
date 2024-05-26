import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import { VitePWA } from "vite-plugin-pwa";

const base = "/ware-home-ai/";

// https://vitejs.dev/config/
export default defineConfig({
    base,
    define: {
        "process.env": {
            BASE_URL: base,
        },
    },
    plugins: [
        vue(),
        VitePWA({
            registerType: "autoUpdate",
            manifest: {
                name: "WareHome AI",
                short_name: "WareHome AI",
                description:
                    "A personal warehouse management app that helps you keep track of household storage with a specialized LLM!",
                theme_color: "#000000",
                background_color: "#000000",
                icons: [
                    {
                        src: "public/assets/manifest-icon-192.maskable.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "any",
                    },
                    {
                        src: "public/assets/manifest-icon-192.maskable.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "maskable",
                    },
                    {
                        src: "public/assets/manifest-icon-512.maskable.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any",
                    },
                    {
                        src: "public/assets/manifest-icon-512.maskable.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
