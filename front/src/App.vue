<template>
  <div id="app" class="app">
    <header class="header">
      <h1 class="title">
        灌溉收费管理系统（内测）
      </h1>
    </header>
    <router-view></router-view>
  </div>
</template>

<style lang="less">
* {
  margin: 0;
  padding: 0;
  border: 0;
  text-decoration: none;
}
body {
  background-color: #f0f2f5;
}
.app {
  position: absolute;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
}
.header {
  flex: 0 0 60px;
  background-color: #fff;
  box-shadow: 0 2px 8px #e3e5e7;
  height: 60px;
  line-height: 60px;
  box-sizing: border-box;
  .title {
    font-size: 22px;
    margin-left: 20px;
  }
}
</style>
