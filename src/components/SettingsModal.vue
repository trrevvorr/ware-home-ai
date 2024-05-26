<template>
  <div class="modal">
    <div class="modal-content">
      <h2>OpenAI Credentials</h2>
      <input v-model="secret" placeholder="OpenAI Secret Key" />
      <input v-model="assistantId" placeholder="Assistant ID" />
      <input v-model="threadId" placeholder="Thread ID" />
      <div class="buttons">
        <button @click="saveSettings">Save</button>
        <button @click="cancelSettings">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    initialSecret: {
        type: String,
        required: true
      },
    initialAssistantId: {
        type: String,
        required: true
      },
    initialThreadId: {
        type: String,
        required: true
      },
  },
  data() {
    return {
      secret: this.initialSecret,
      assistantId: this.initialAssistantId,
      threadId: this.initialThreadId,
    };
  },
  methods: {
    saveSettings() {
      this.$emit('save-settings', {
        secret: this.secret,
        assistantId: this.assistantId,
        threadId: this.threadId,
      });
    },
    cancelSettings() {
      this.$emit('cancel-settings');
    },
  },
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10000;
}

.buttons {
  display: grid;
  grid-template-columns: auto auto;
  gap: 0.5rem;
  margin-top: 2rem;
}

.buttons button{
    color: white;
    height: 2rem;
    background: black;
    border: none;
    outline: none;
    border-radius: 1rem;
}

.modal-content {
  background: white;
  color: black;
  padding: 20px;
  border-radius: 4px;
  text-align: center;
  border-radius: 1rem;
}

input {
  display: block;
  width: 80%;
  margin: 10px auto;
  padding: 10px;
  border: 1px solid #444;
  border-radius: 4px;
}
</style>
