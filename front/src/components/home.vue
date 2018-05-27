<template>
  <div class="content">
    <div class="aside">
      <h1 class="title">
        灌溉收费管理系统
      </h1>
      <el-menu
        :default-active="path"
        @select="handleSelect">
        <el-menu-item index="list">
          <i class="el-icon-edit-outline"></i>
          <span slot="title">灌溉记录</span>
        </el-menu-item>
        <el-menu-item index="statistics">
          <i class="el-icon-tickets"></i>
          <span slot="title">统计列表</span>
        </el-menu-item>
        <el-menu-item index="recycle">
          <i class="el-icon-delete"></i>
          <span slot="title">回收站</span>
        </el-menu-item>
      </el-menu>
    </div>
    <router-view :key="path" :path="path" :currentNav="currentNav"></router-view>
  </div>
</template>

<script>
export default {
  name: 'home',

  computed: {
    // 当前路由
    path () {
      return this.$route.path.replace('/', '') || 'list'
    },

    // 当前页面
    currentNav () {
      if (this.path === 'statistics') {
        return '统计列表'
      } else if (this.path === 'recycle') {
        return '回收站'
      } else {
        return '灌溉记录'
      }
    }
  },

  methods: {
    handleSelect (path) {
      this.$router.push(path)
    }
  }
}
</script>

<style lang="less" scoped>
.content {
  flex: 1 1 auto;
  background-color: #fff;
  margin: 0 auto;
  min-width: 1200px;
  display: flex;
  padding: 15px 0;
  .aside {
    width: 200px;
    flex: 0 0 200px;
    .title {
      font-size: 20px;
      line-height: 1;
      margin: 0 5px;
      text-align: center;
      height: 38px;
      border-bottom: 5px solid #ebeef5;
      margin-bottom: 10px;
    }
  }
}
</style>
