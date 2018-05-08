<template>
  <div class="main">
    <div class="main-head">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{currentNav}}</el-breadcrumb-item>
      </el-breadcrumb>
      <el-button
        type="success"
        size="small"
        class="add-button">
        导出
      </el-button>
    </div>

    <div class="panel">
      <el-button @click="toggleExpansion">{{expandButtonText}}</el-button>
      <el-date-picker
        v-model="month"
        type="month"
        @change="handleMonth"
        :picker-options="pickerOptions"
        :editable="false"
        :clearable="false"
        placeholder="按月筛选">
      </el-date-picker>
    </div>

    <el-table
      ref="table"
      class="table-list"
      :data="tableData"
      :height="tableHeight"
      show-summary
      style="width=100%"
      header-row-class-name="head-bg"
      @expand-change="handleExpandChange">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table
            border
            :data="props.row.children"
            style="width: 100%">
            <el-table-column
              type="index"
              width="50">
            </el-table-column>
            <el-table-column
              label="开井时间">
              <template slot-scope="scope">
                {{ scope.row.startTime }}
              </template>
            </el-table-column>
            <el-table-column
              label="关井时间">
              <template slot-scope="scope">
                {{ scope.row.endTime }}
              </template>
            </el-table-column>
            <el-table-column
              label="耗时">
              <template slot-scope="scope">
                {{ scope.row.period | toHHMM }}
              </template>
            </el-table-column>
            <el-table-column
              prop="cost"
              label="费用(元)">
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        prop="userName"
        label="姓名">
      </el-table-column>
      <el-table-column
        prop="count"
        label="灌溉次数">
      </el-table-column>
      <el-table-column
        prop="period"
        label="耗时">
        <template slot-scope="scope">
          {{ scope.row.period | toHHMM }}
        </template>
      </el-table-column>
      <el-table-column
        prop="cost"
        label="费用小计">
        <template slot-scope="scope">
          <span class="cost">{{ scope.row.cost }}</span>元
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { axios } from '@/bus'
let lazy

// 计算Table高度
const tableHeight = window.innerHeight - (60 + 15 + 40 + 43 + 52)

export default {
  props: {
    currentNav: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      tableData: [],
      tableHeight: tableHeight,
      month: new Date(),
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      expandButtonText: '全部展开'
    }
  },

  methods: {
    getList () {
      const url = 'Statistics.html'
      const params = {
        month: this.month.getMonth()
      }

      axios(url, params)
        .then((data) => {
          this.tableData = data.result
        })
    },

    // 监听月份筛选
    handleMonth (value) {
      this.getList()
    },

    // 全部展开、全部折叠
    toggleExpansion () {
      this.tableData.forEach(row => {
        this.$refs.table.toggleRowExpansion(row)
      })
    },

    // 监听展开状态
    handleExpandChange (row, expandedRows) {
      clearTimeout(lazy)
      lazy = setTimeout(() => {
        this.changeExpandButtonText(expandedRows)
      }, 50)
    },

    // 改变展开、折叠按钮文字
    changeExpandButtonText (value) {
      this.expandButtonText = value.length ? '全部折叠' : '全部展开'
    }
  },
  filters: {
    toHHMM (value) {
      const hh = Math.floor(value / 60)
      const mm = value % 60
      return `${hh}时${mm}分`
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
        top: -7px;
      }
    }
    .panel {
      margin-top: 20px;
      text-align: right;
      .el-button{
        float: left;
      }
    }
    .table-list {
      margin-top: 20px;
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
      margin-top: 20px;
      text-align: right;
    }
  }

</style>
<style lang="less">
  .el-table {
    .head-bg {
      th {
        background-color: #f5f7fa;
      }
    }
  }
</style>
