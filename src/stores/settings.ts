import { defineStore } from 'pinia';

export interface SettingsState {
  secret: string;
  assistantId: string;
  threadId: string;
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    secret: localStorage.getItem('openaiSecret') || '',
    assistantId: localStorage.getItem('assistantId') || '',
    threadId: localStorage.getItem('threadId') || '',
  }),
  actions: {
    setSettings(secret: string, assistantId: string, threadId: string) {
      this.secret = secret;
      this.assistantId = assistantId;
      this.threadId = threadId;
      localStorage.setItem('openaiSecret', secret);
      localStorage.setItem('assistantId', assistantId);
      localStorage.setItem('threadId', threadId);
    },
  },
});
