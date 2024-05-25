<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
    <div id="app">
        <RouterView />
    </div>
</template>

<style scoped>
#app {
    background-color: black;
    color: white;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
