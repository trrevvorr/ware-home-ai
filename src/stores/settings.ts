import { defineStore } from 'pinia';

export interface SettingsState {
  secret: string;
  assistantId: string;
  threadId: string;
  displayForced: boolean;
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    secret: localStorage.getItem('openaiSecret') || '',
    assistantId: localStorage.getItem('assistantId') || '',
    threadId: localStorage.getItem('threadId') || '',
    displayForced: false
  }),
  getters: {
    requiredDataProvided(state): boolean {
        return !!state.secret.trim() && !!state.assistantId.trim() && !!state.threadId.trim();
    },
    displaySettings(state): boolean {
      return !this.requiredDataProvided || state.displayForced;
  },
  },
  actions: {
    setSettings(secret: string, assistantId: string, threadId: string) {
      this.secret = secret;
      this.assistantId = assistantId;
      this.threadId = threadId;
      localStorage.setItem('openaiSecret', secret);
      localStorage.setItem('assistantId', assistantId);
      localStorage.setItem('threadId', threadId);
      this.displayForced = false;
    },
    cancelSettings() {
      this.displayForced = false;
    },
    forceSettingsDisplay() {
      this.displayForced = true;
    }
  },
});
