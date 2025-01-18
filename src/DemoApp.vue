<template>
  <router-view />
</template>
<script>
export default {
  name: "DemoApp",
  components: {},
  mounted() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.style.setProperty('color-scheme', 'light');
    }

  }
}
</script>
