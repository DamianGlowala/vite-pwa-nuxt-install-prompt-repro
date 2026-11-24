<template>
    <div>
        <NuxtPwaManifest />

        <div v-if="pwaPrompt.isInstallPromptShown.value">
            <p>Install prompt is available.</p>

            <button type="button" @click="pwa?.install()">Install</button>
        </div>

        <p v-else>Install prompt is not available.</p>
    </div>
</template>

<script setup lang="ts">
const pwa = usePWA()

const pwaPrompt = usePwaPrompt()
</script>
