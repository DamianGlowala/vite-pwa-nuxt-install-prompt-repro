export default defineNuxtConfig({
    modules: ['@vite-pwa/nuxt'],
    devtools: { enabled: true },
    app: {
        head: {
            script: [
                {
                    innerHTML:
                        "addEventListener('beforeinstallprompt', () => console.log('[head] beforeinstallprompt fired', performance.now()))",
                    tagPosition: 'head',
                },
            ],
        },
    },
    compatibilityDate: '2026-07-10',
    pwa: {
        manifest: {
            name: 'Install Prompt Repro',
            short_name: 'Repro',
            start_url: '/',
            display: 'standalone',
            theme_color: '#00dc82',
            background_color: '#ffffff',
            icons: [
                {
                    src: '/pwa-192x192.png',
                    type: 'image/png',
                    sizes: '192x192',
                },
                {
                    src: '/pwa-512x512.png',
                    type: 'image/png',
                    sizes: '512x512',
                    purpose: 'any',
                },
            ],
        },
        client: {
            installPrompt: true,
        },
        devOptions: {
            enabled: true,
        },
    },
    future: {
        compatibilityVersion: 5,
    },
})
