<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
html, body, #app {
  width: 100vw;
  height: 100vh;
  min-width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden !important;
  box-sizing: border-box;
  background: linear-gradient(120deg, #f8fafc 60%, #e6eeff 100%);
}
</style>