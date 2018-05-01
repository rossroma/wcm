<template>
  <div id="app">
    <img src="./assets/logo.png">
    <router-view/>
  </div>
</template>

<script>
import { post } from './bus'
export default {
  name: 'App',
  methods: {
    testApi () {
      const url = 'List.html'
      const params = {
        pageSize: 20,
        currentPage: 1
      }
      post(url, params)
        .then((data) => {
          console.log(data)
        })
    }
  },

  created () {
    this.testApi()
  }
}
</script>

<style lang="less">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
