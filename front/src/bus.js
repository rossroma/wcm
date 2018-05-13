import Axios from 'axios'
import {Message} from 'element-ui'

// 根据环境自动切换path地址
const path = process.env.NODE_ENV === 'production' ? '/' : '/api/'

// post请求
const axios = function (url, params, method = 'post') {
  return new Promise((resolve, reject) => {
    Axios[method](`${path}${url}`, params)
      .then((response) => {
        resolve(response.data)
        if (response.data.code === 1) {
          resolve(response.data)
        } else {
          Message({
            type: 'error',
            message: response.data.msg
          })
          reject(response.data)
        }
      })
  })
}

// 封装localStorage
const storage = function () {
  return {
    set: function (key, value) {
      window.localStorage.setItem(key, value)
    },
    get: function (key) {
      return window.localStorage.getItem(key)
    },
    remove: function (key) {
      window.localStorage.removeItem(key)
    }
  }
}

export {
  path,
  axios,
  storage
}
