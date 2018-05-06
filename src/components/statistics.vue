<template>
  <div class="main">
    <div class="main-head">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{currentNav}}</el-breadcrumb-item>
      </el-breadcrumb>

      <el-date-picker
        v-model="month"
        type="month"
        placeholder="选择月">
      </el-date-picker>
    </div>

    <el-table
      class="table-list"
      :data="tableData"
      :height="tableHeight"
      show-summary
      style="width=100%">
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
import { post } from '@/bus'

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
      sumary: [],
      tableHeight: tableHeight,
      month: ''
    }
  },

  methods: {
    getList () {
      const url = 'Statistics.html'
      const params = {
        month: this.month
      }

      post(url, params)
        .then((data) => {
          this.tableData = data.result
          this.sumary = data.sumary
        })
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
      .el-date-editor {
        position: absolute;
        right: 10px;
        top: -7px;
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
