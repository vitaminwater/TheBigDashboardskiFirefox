<template>
  <div id='app'>
    <div v-if='!loading'>
      <div v-for='(setting, name) in settings'>
        {{ name }}: <input v-model="settings[name]">
      </div>
      <button @click="persist">Save</button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

const DEFAULT_SETTINGS = {
  screen: 0,
  tab1: '',
  tab2: '',
  tab3: '',
  tab4: '',
}

export default {
  data() {
    return {
      loading: true,
      settings: {},
    }
  },
  async mounted() {
    const stored = await browser.storage.local.get(Object.keys(DEFAULT_SETTINGS))
    Object.keys(DEFAULT_SETTINGS).forEach((k) => {
      this.$set(this.settings, k, stored[k] || DEFAULT_SETTINGS[k])
    })
    this.loading = false
  },

  methods: {
    async persist() {
      const store = {}
      Object.keys(DEFAULT_SETTINGS).forEach((k) => {
        console.log(this.settings[k])
        store[k] = this.settings[k]
      })
      await browser.storage.local.set(store);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
