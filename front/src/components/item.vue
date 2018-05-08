<template>
  <div class="edit-wrap">
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="800px"
      :before-close="closeDialog">
      <div class="form-wrap" v-if="editStatus">
        <el-form ref="form" :model="form" label-width="120px" :rules="rules">
          <el-form-item label="姓名" prop="userName">
            <el-input v-model="form.userName"></el-input>
          </el-form-item>
          <el-form-item label="开井时间">
            <el-col :span="11">
              <el-form-item prop="date1">
                <el-date-picker
                  type="date"
                  placeholder="选择日期"
                  :editable="false"
                  v-model="form.date1"
                  value-format="yyyy-MM-dd"
                  style="width: 100%;"
                  @change="handleStartDate"
                  :picker-options="pickerOptions">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col class="line" :span="2">-</el-col>
            <el-col :span="11">
              <el-form-item prop="time1">
                <el-time-picker
                  type="fixed-time"
                  placeholder="选择时间"
                  :editable="false"
                  v-model="form.time1"
                  value-format="HH:mm"
                  style="width: 100%;">
                </el-time-picker>
              </el-form-item>
            </el-col>
          </el-form-item>
          <el-form-item label="关井时间">
            <el-col :span="11">
              <el-form-item prop="date2">
                <el-date-picker
                  type="date"
                  placeholder="选择日期"
                  :editable="false"
                  v-model="form.date2"
                  value-format="yyyy-MM-dd"
                  style="width: 100%;"
                  :picker-options="pickerOptions">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col class="line" :span="2">-</el-col>
            <el-col :span="11">
              <el-form-item prop="time2">
                <el-time-picker
                  type="fixed-time"
                  placeholder="选择时间"
                  :editable="false"
                  v-model="form.time2"
                  value-format="HH:mm"
                  style="width: 100%;">
                </el-time-picker>
              </el-form-item>
            </el-col>
          </el-form-item>
        </el-form>
      </div>
      <table class="table-list" v-else>
        <tr class="row thead">
          <th class="col">姓名</th>
          <th class="col">开井时间</th>
          <th class="col">关井时间</th>
          <th class="col">耗时(分钟)</th>
          <th class="col">费用</th>
        </tr>
        <tr class="row">
          <td class="col">{{formatData.userName}}</td>
          <td class="col">{{formatData.startTime}}</td>
          <td class="col">{{formatData.endTime}}</td>
          <td class="col">{{formatData.period | toHHMM}}</td>
          <td class="col"><span class="cost">{{formatData.cost}}</span>元</td>
        </tr>
      </table>
      <span slot="footer" class="dialog-footer">
        <template v-if="editStatus">
          <el-button @click="closeDialog">取 消</el-button>
          <el-button type="primary" @click="handleSubmit('form')">保 存</el-button>
        </template>
        <template v-else>
          <el-button type="danger" plain @click="editStatus = true">修 改</el-button>
          <el-button type="primary" @click="continueAdd">继续添加</el-button>
        </template>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { axios } from '@/bus'
const originForm = {
  userName: '',
  date1: '',
  time1: '',
  date2: '',
  time2: ''
}
export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      dialogVisible: true,
      form: {},
      rules: {
        userName: { required: true, message: '请输入姓名', trigger: 'blur' },
        date1: { required: true, message: '请选择开井日期', trigger: 'change' },
        time1: { required: true, message: '请选择开井时间', trigger: 'change' },
        date2: { required: true, message: '请选择关井日期', trigger: 'change' },
        time2: { required: true, message: '请选择关井时间', trigger: 'change' }
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [{
          text: '今天',
          onClick (picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick (picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '前天',
          onClick (picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 2)
            picker.$emit('pick', date)
          }
        }]
      },
      formatData: {
        userName: '',
        startTime: '',
        endTime: '',
        period: '',
        cost: ''
      },
      editStatus: true
    }
  },

  computed: {
    dialogTitle () {
      return this.form.id ? '修改记录' : '新增记录'
    }
  },

  created () {
    // 初始化赋值
    if (this.item.id) {
      this.initItem()
    } else {
      this.form = Object.assign({}, originForm)
    }
  },

  methods: {
    // 数据初始化
    initItem () {
      const copyItem = Object.assign({}, this.item)
      this.form = {
        id: copyItem.id,
        userName: copyItem.userName,
        date1: copyItem.startTime.slice(0, 10),
        time1: copyItem.startTime.slice(11),
        date2: copyItem.endTime.slice(0, 10),
        time2: copyItem.endTime.slice(11)
      }
    },

    // 监听开井日期的变化
    handleStartDate (value) {
      this.$set(this.form, 'date2', value)
    },

    // 监听保存按钮
    handleSubmit (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.beforeSave(this.form)
        } else {
          return false
        }
      })
    },

    // 保存数据之前的动作
    beforeSave (form) {
      const copyForm = Object.assign({}, form)
      const startTime = `${copyForm.date1} ${copyForm.time1}`
      const endTime = `${copyForm.date2} ${copyForm.time2}`
      const period = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000 / 60
      const cost = Number((period * 0.9).toFixed(2))
      if (period <= 0) {
        this.$notify({
          title: '警告',
          message: '关井时间不能在开井时间之前！',
          type: 'error'
        })
        return false
      } else if (period > 1440) {
        this.$notify({
          title: '警告',
          message: '灌溉时间超过24小时，请检查是否输入正确！',
          type: 'error'
        })
        return false
      }
      this.formatData = {
        userName: copyForm.userName,
        startTime: startTime,
        endTime: endTime,
        period: period,
        cost: cost
      }
      this.saveData(this.formatData)
    },

    // 保存数据
    saveData (data) {
      const url = 'Item.html'
      const params = {
        id: this.form.id || 0,
        data: data
      }
      axios(url, params)
        .then((data) => {
          this.$message({
            type: 'success',
            message: data.msg
          })
          this.$set(this.form, 'id', data.id)
          this.editStatus = false
        })
    },

    // 继续添加
    continueAdd () {
      this.form = Object.assign({}, originForm)

      this.editStatus = true
    },

    closeDialog () {
      this.$emit('close')
    }
  },

  filters: {
    toHHMM (value) {
      const hh = Math.floor(value / 60)
      const mm = value % 60
      return `${hh}时${mm}分`
    }
  }
}
</script>

<style lang="less" scoped>
  .edit-wrap {
    .form-wrap {
      padding-right: 150px;
      padding-bottom: 0;
      .line {
        text-align: center;
      }
    }
    .table-list {
      width: 100%;
      .row {
        .col {
          font-size: 14px;
          padding: 12px 10px;
          line-height: 24px;
          border-bottom: 1px solid #ebeef5;
          text-align: left;
          .cost {
            color: red;
            font-weight: bold;
            margin-right: 4px;
          }
        }
        &.thead {
          color: #909399;
          font-weight: bold;
        }
      }
    }
  }
</style>
