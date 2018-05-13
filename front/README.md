# wcm-front

> 灌溉收费管理系统（Watering Charge Management）

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```



### 开启mock模式

`/front/config/index.js`，修改proxyTable的target属性值为：`http://yapi.xbongbong.com/mock/45/`

```javascript
    proxyTable: {
      '/api': {
        // mocck
        target: 'http://yapi.xbongbong.com/mock/45/'
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    },
```

