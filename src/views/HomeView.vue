<template>
    <div id="home">
        <SettingsModal
            v-if="displaySettings"
            :allow-cancel="requiredDataProvided"
            :initialSecret="secret"
            :initialAssistantId="assistantId"
            :initialThreadId="threadId"
            @save-settings="saveSettings"
            @cancel-settings="cancelSettings"
        />
        <ThreadInterface
            v-if="requiredDataProvided"
            @force-settings-display="forceSettingsDisplay"
        />
    </div>
</template>

<script lang="ts">
import { useSettingsStore } from "@/stores/settings";
import SettingsModal from "@/components/SettingsModal.vue";
import ThreadInterface from "@/components/ThreadInterface.vue";
import { mapState } from "pinia";

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
    computed: {
        ...mapState(useSettingsStore, [
            "displaySettings",
            "requiredDataProvided",
            "secret",
            "assistantId",
            "threadId",
        ]),
    },
    methods: {
        saveSettings(settings: { secret: string; assistantId: string; threadId: string }) {
            this.settingsStore.setSettings(
                settings.secret,
                settings.assistantId,
                settings.threadId
            );
        },
        cancelSettings() {
            this.settingsStore.cancelSettings();
        },
        forceSettingsDisplay() {
            this.settingsStore.forceSettingsDisplay();
        },
    },
};
</script>

<style scoped></style>
