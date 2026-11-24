export function usePwaPrompt() {
    const pwa = usePWA()

    watchEffect(() =>
        console.log('[composable] showInstallPrompt', pwa?.showInstallPrompt, performance.now()),
    )

    const isInstallPromptShown = computed(
        () => !pwa?.isPWAInstalled && !!pwa?.showInstallPrompt,
    )

    return {
        isInstallPromptShown,
    }
}
