<template>
  <div class="modal">
    <div class="modal-content">
      <h2>OpenAI Credentials</h2>
      <input v-model="secret" placeholder="OpenAI Secret Key" />
      <input v-model="assistantId" placeholder="Assistant ID" />
      <input v-model="threadId" placeholder="Thread ID" />
      <button @click="saveSettings">Save</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      secret: '',
      assistantId: '',
      threadId: '',
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
}

.modal-content {
  background: white;
  color: black;
  padding: 20px;
  border-radius: 4px;
  text-align: center;
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
