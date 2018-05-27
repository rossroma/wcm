<template>
  <div class="main">
    <div class="main-head">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{currentNav}}</el-breadcrumb-item>
      </el-breadcrumb>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-edit"
        class="add-button"
        @click="addLog">
        新增记录
      </el-button>
    </div>

    <el-table
      class="table-list"
      :data="tableData"
      :height="tableHeight"
      v-loading="loading"
      style="width=100%">
      <el-table-column
        label="日期"
        width="180">
        <template slot-scope="scope">
          <i class="el-icon-date"></i>
          <span style="margin-left: 10px">{{ scope.row.startTime | formatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="userName"
        label="姓名"
        width="120">
      </el-table-column>
      <el-table-column
        label="开井时间"
        width="120">
        <template slot-scope="scope">
          {{ scope.row.startTime | formatTime }}
        </template>
      </el-table-column>
      <el-table-column
        label="关井时间"
        width="120">
        <template slot-scope="scope">
          {{ scope.row.endTime | formatTime }}
        </template>
      </el-table-column>
      <el-table-column
        label="耗时"
        width="140">
        <template slot-scope="scope">
          {{ scope.row.period | toHHMM }}
        </template>
      </el-table-column>
      <el-table-column
        label="费用"
        width="140">
        <template slot-scope="scope">
          <span class="cost">{{ scope.row.cost | formatMoney }}</span>元
        </template>
      </el-table-column>
      <el-table-column
        v-if="isRecycle"
        label="操作">
        <template slot-scope="scope">
          <el-button @click="handleRestore(scope.row)" type="text" size="small">还原</el-button>
          <el-button @click="handleCompletelyDelete(scope.row)" type="text" size="small" class="red">彻底删除</el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-else
        label="操作">
        <template slot-scope="scope">
          <el-button @click="handleEdit(scope.row)" type="text" size="small">修改</el-button>
          <el-button @click="handleDelete(scope.row)" type="text" size="small" class="red">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="main-foot">
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="pageInfos.count"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageInfos.size"
        :current-page.sync="pageInfos.current"
        @size-change="handleSizeChange"
        @current-change="getList"
        class="pagination">
      </el-pagination>
    </div>

    <Item
      v-if="isItemShow"
      :item="item"
      @close="isItemShow = false"
      @refresh="getList">
    </Item>
  </div>
</template>

<script>
import { axios } from '@/bus'
import Item from '@/components/item'

// 计算Table高度
const tableHeight = window.innerHeight - (60 + 15 + 40 + 43 + 52)

export default {
  props: {
    currentNav: {
      type: String,
      required: true
    },

    path: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      tableData: [],
      pageSizes: [10, 20, 50, 100],
      pageInfos: {
        size: 20,
        current: 1,
        count: 0
      },
      tableHeight: tableHeight,
      // 编辑/新建相关
      isItemShow: false,
      item: {},
      loading: false
    }
  },

  computed: {
    isRecycle () {
      return this.path === 'recycle'
    }
  },

  components: {
    Item
  },

  methods: {
    getList (e) {
      this.loading = true
      const url = 'List.html'
      const params = {
        pageSize: this.pageInfos.size,
        currentPage: this.pageInfos.current
      }

      // 回收站列表
      if (this.isRecycle) {
        params.status = 1
      }
      axios(url, params)
        .then((data) => {
          this.tableData = data.result
          this.pageInfos.count = data.count
          this.loading = false
        })
        .then(() => {
          this.loading = false
        })
    },

    handleSizeChange (value) {
      this.pageInfos.size = value
      this.getList()
    },

    // 新增记录
    addLog () {
      this.item = {}
      this.isItemShow = true
    },

    // 修改
    handleEdit (row) {
      this.item = row
      this.isItemShow = true
    },

    // 删除
    handleDelete (row) {
      this.$confirm('确定要删除该记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.changeLogStatus(row.id, 1)
      }).catch(() => {})
    },

    // 还原
    handleRestore (row) {
      this.$confirm('确定要还原该记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.changeLogStatus(row.id, 0)
      }).catch(() => {})
    },

    // 改变记录状态值，即删除和还原
    changeLogStatus (id, status) {
      const url = 'ChangeStatus.html'
      const params = {
        id: id,
        status: status
      }
      axios(url, params)
        .then((data) => {
          this.$message({
            type: 'success',
            message: data.msg
          })

          // 刷新列表
          this.getList()
        })
    },

    // 监听删除事件
    handleCompletelyDelete (row) {
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.completelyDelete(row.id)
      }).catch(() => {})
    },

    // 彻底删除
    completelyDelete (id) {
      const url = 'Delete.html'
      const params = {
        id: id
      }
      axios(url, params)
        .then((data) => {
          this.$message({
            type: 'success',
            message: data.msg
          })

          // 刷新列表
          this.getList()
        })
    }
  },

  filters: {
    formatDate (value) {
      return value.slice(0, 10)
    },

    formatTime (value) {
      return value.slice(10, 16)
    },

    toHHMM (value) {
      const hh = Math.floor(value / 60)
      const mm = value % 60
      return `${hh}时${mm}分`
    },

    formatMoney (value) {
      return value.toFixed(2)
    }
  },

  created () {
    this.getList()
  }
}
</script>

<style lang="less" scoped>
  .main {
    flex: 1 1 auto;
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    .main-head {
      position: relative;
      height: 35px;
      border-bottom: 5px solid #ebeef5;
      padding: 3px 0 0 10px;
      .add-button {
        position: absolute;
        right: 10px;
        top: -5px;
      }
    }
    .table-list {
      margin-top: 15px;
      .cost {
        color: red;
        font-weight: bold;
        margin-right: 4px;
      }
      .red {
        color: red;
      }
    }
    .main-foot {
      margin-top: 15px;
      text-align: right;
    }
  }
</style>
