<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
    <div class="app">
        <RouterView />
    </div>
</template>

<style scoped>
.app {
    background-color: black;
    color: white;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overscroll-behavior: none;
    overflow: hidden;
}
</style>
