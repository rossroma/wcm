import Axios from 'axios'

// 根据环境自动切换path地址
const path = process.env.NODE_ENV === 'production' ? '/' : 'http://yapi.xbongbong.com/mock/45/'

// post请求
const axios = function (url, params, method = 'post') {
  return new Promise((resolve, reject) => {
    Axios[method](`${path}${url}`, params)
      .then((response) => {
        resolve(response.data)
      })
      .then((response) => {
        reject(response)
      })
  })
}

// 封装sessionStorage
const storage = function () {
  return {
    set: function (key, value) {
      window.sessionStorage.setItem(key, value)
    },
    get: function (key) {
      return window.sessionStorage.getItem(key)
    },
    remove: function (key) {
      window.sessionStorage.removeItem(key)
    }
  }
}

export {
  path,
  axios,
  storage
}
