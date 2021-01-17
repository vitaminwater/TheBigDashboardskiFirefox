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
  mqtt_server: 'node.local',
  mqtt_server_port: '1884',
  screen: 1,
  tab1: '',
  tab2: '',
  tab3: '',
  tab4: '',
}

async function get(keys) {
  return await new Promise(r => chrome.storage.local.get(keys, r))
}

async function set(keys) {
  return await new Promise(r => chrome.storage.local.set(keys, r))
}

async function query(params) {
  return await new Promise(r => chrome.tabs.query(params, r))
}

async function executeScript(tabId, details) {
  return await new Promise(r => chrome.tabs.executeScript(id, details))
}

export default {
  data() {
    return {
      loading: true,
      settings: {},
    }
  },
  async mounted() {
    const stored = await get(Object.keys(DEFAULT_SETTINGS))
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
      await set(store);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
