<template>
    <div id="home">
        <SettingsModal v-if="!settingsStore.secret" @save-settings="saveSettings" />
        <ThreadInterface v-else />
    </div>
</template>

<script lang="ts">
import { ref, nextTick } from "vue";
import { useSettingsStore } from "../stores/settings";
import SettingsModal from "../components/SettingsModal.vue";
import ThreadInterface from "../components/ThreadInterface.vue";

export default {
    name: "HomeView",
    components: {
        SettingsModal,
        ThreadInterface,
    },
    data() {
        return {
            settingsStore: useSettingsStore(),
        };
    },
    created() {},
    methods: {
        saveSettings(settings: { secret: string; assistantId: string; threadId: string }) {
            this.settingsStore.setSettings(
                settings.secret,
                settings.assistantId,
                settings.threadId
            );
        },
    },
};
</script>

<style scoped>
</style>
