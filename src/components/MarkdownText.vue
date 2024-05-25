<template>
    <div v-html="compiledMarkdown"></div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import MarkdownIt from 'markdown-it';
  
  export default defineComponent({
    name: 'MarkdownText',
    props: {
      content: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        md: new MarkdownIt(),
        compiledMarkdown: "",
      };
    },
    created() {
        this.compiledMarkdown = this.md.render(this.content);
    },
    watch: {
      content(newContent: string) {
        this.compiledMarkdown = this.md.render(newContent);
      }
    }
  });
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  