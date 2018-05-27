const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
// 导出
const nodeExcel = require('excel-export')
const Utils = require(__dirname + '/utils')
const Config = require(__dirname + '/conf.js')

const app = express()
app.use(bodyParser.json())
app.use(express.static(__dirname + '/front/dist'))
app.use(cookieParser())

// 设置响应头
app.all('*', function (req, res, next) {
	res.header('content-type', 'application/json;charset=utf-8')
	next()
})

// 处理返回异常
const apiUrl = 'https://api.bmob.cn/1/classes/'
const headerText = Config.bmob

// 显示错误信息
function showError(error, body, res) {
	let errorMsg
	if (error) {
		errorMsg = `basic error：${error}`
	} else if (body && body.error) {
		errorMsg = `bmob  error: ${body.error}`
	} else {
		return false
	}
	res.end(formatResponse({}, errorMsg, 10))
	return true
}

// 格式化返回信息
function formatResponse(data, msg = '操作成功！', code = 1) {
	let result = {
		code: code,
		msg: msg,
	}
	Object.assign(result, data)
	return JSON.stringify(result)
}

// 处理ajax请求
function restful(callback, res, url, methType = 'GET', body) {
	let options = {
		method: methType || 'GET',
	  url: apiUrl + url,
	  headers: headerText,
	  json: true
	}
	if (body) {
		options.body = body
	}
	request(options, function (error, response, data) {
		if (showError(error, data, res)) return
		callback(data)
	})
}

// 拼接统计参数
function spliceParams (timeStamp) {
	const date = new Date(timeStamp)
	const year = date.getFullYear()
	const month = Number(date.getMonth()) + 1
	const formatMonth = `0${month}`.slice(-2)
	const lastDay = new Date(year, formatMonth, 0).getDate()
	const startTime = `${year}-${formatMonth}-01`
	const endTime = `${year}-${formatMonth}-${lastDay}`
	// 查询条件 {"$and":[{"startTime":{"$gte":{"__type": "Date", "iso": "2018-05-01 00:00:00"}}}, {"startTime":{"$lte":{"__type": "Date", "iso": "2018-05-31 23:59:59"}}},{"status": 0}]}
	return `List?where=%7B%22$and%22:%5B%7B%22startTime%22:%7B%22$gte%22:%7B%22__type%22:%20%22Date%22,%20%22iso%22:%20%22${startTime}%2000:00:00%22%7D%7D%7D,%20%7B%22startTime%22:%7B%22$lte%22:%7B%22__type%22:%20%22Date%22,%20%22iso%22:%20%22${endTime}%2023:59:59%22%7D%7D%7D,%7B%22status%22:%200%7D%5D%7D`
}

// 时分格式化
function toHHMM(value) {
	const hh = Math.floor(value / 60)
	const mm = value % 60
	return `${hh}时${mm}分`
}

// 获取统计返回数据
function getStatisticsResults (data) {
	let result = []
	let count = 0
	let period = 0
	let cost = 0

	data.results.forEach(item => {
		const index = result.findIndex(row => row.userName === item.userName)
		if (index > -1) {
			result[index].count += 1
			result[index].period += item.period
			result[index].cost = Number((result[index].cost + item.cost).toFixed(2)) // 规避浮点数计算精度问题
			result[index].children.push(
				{
					id: item.objectId,
					startTime: item.startTime.iso,
					endTime: item.endTime.iso,
					period: item.period,
					cost: item.cost
				}
			)
		} else {
			result.push({
				userName: item.userName,
				count: 1,
				period: item.period,
				cost: item.cost,
				children: [
					{
						id: item.objectId,
						startTime: item.startTime.iso,
						endTime: item.endTime.iso,
						period: item.period,
						cost: item.cost
					}
				]
			})
		}
		count += 1
		period += item.period
		cost = Number((cost + item.cost).toFixed(2)) // 规避浮点数计算精度问题
	})

	return {
		result,
		summary: {
			cost: (cost).toFixed(2) + '元',
			period: toHHMM(period),
			count: count + '次'
		}
	}
}

// 格式化sheet2 的数据
function createSheet2(result) {
	let newArr = []
	const emptyRow = ['', '', '', '', '', '']
	result.forEach(item => {
		newArr.push(emptyRow)
		item.children.forEach((child, index) => {
			newArr.push([
				'',
				index + 1,
				child.startTime.slice(0, -3),
				child.endTime.slice(0, -3),
				toHHMM(child.period),
				child.cost
			])
		})
		newArr.push([
			item.userName,
			'',
			'',
			'',
			toHHMM(item.period),
			item.cost
		])
	})
	return newArr
}

// 灌溉列表、回收站
app.post('/List.html', function (req, res) {
	const pageSize = req.body.pageSize || 20
	const currentPage = req.body.currentPage || 1
	const skip = pageSize * (currentPage - 1)
	const status = req.body.status || 0
	const url = `List?where=%7B%22status%22:${status}%7D&limit=${pageSize}&count=1&skip=${skip}&order=-startTime`

	restful((data) => {
		let result = {
			count: data.count
		}
		if (data.results) {
			result.result = data.results.map(item => {
				return {
					id: item.objectId,
					userName: item.userName,
					startTime: item.startTime.iso,
					endTime: item.endTime.iso,
					period: item.period,
					cost: item.cost
				}
			})
		}
		res.end(formatResponse(result))
	}, res, url)
})

// 统计列表
app.post('/Statistics.html', function (req, res) {
	// 拼接url
	const timestamp = req.body.timeStamp - 0 // 转为数字格式
	const url = spliceParams(timestamp)
	restful((data) => {
		const results = getStatisticsResults(data)
		res.end(formatResponse(results))
	}, res, url)
})

// 新建、编辑
app.post('/Item.html', function (req, res) {
	const url = req.body.id ? `List/${req.body.id}` : 'List'
	const method = req.body.id ? 'PUT' : 'POST'
	const item = req.body.data
	item.startTime = Utils.formatDate(item.startTime)
	item.endTime = Utils.formatDate(item.endTime)
	item.status = 0
	
	restful((data) => {
		const result = {
			id: data.objectId || req.body.id
		}
		res.end(formatResponse(result))
	}, res, url, method, item)
})

// 删除、还原
app.post('/ChangeStatus.html', function (req, res) {
	const url = `List/${req.body.id}`
	const item = {status: req.body.status}
	
	restful((data) => {
		const result = {
			id: data.objectId || req.body.id
		}
		res.end(formatResponse(result))
	}, res, url, 'PUT', item)
})

// 彻底删除
app.post('/Delete.html', function (req, res) {
	const url = `List/${req.body.id}`
	
	restful((data) => {
		const result = {
			id: data.objectId || req.body.id
		}
		res.end(formatResponse(result))
	}, res, url, 'DELETE')
})

// 映射到首页
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/front/index.html' )
})

// disable interface layout.hbs  user config layout: false
app.get('/exportExcel/:timestamp', function(req, res, next) {
	// 拼接url
	const timestamp = req.params.timestamp - 0 // 转为数字格式
	const url = spliceParams(timestamp)

	// fileName
	const date = new Date(timestamp)
	const fileName = `${date.getFullYear()}-${date.getMonth() + 1}月份电费统计`
	console.log('统计日期', new Date(timestamp))
	restful((data) => {
		// sheet1
		let conf = {}
		conf.stylesXmlFile = "./wcm/styles.xml"
		conf.name = "sheet1"
		conf.cols = [{
			caption: '姓名',
			type: 'string'
		}, {
			caption: '灌溉次数(次)',
			type: 'number'
		}, {
			caption: '耗时',
			type: 'string'
		}, {
			caption: '费用小计(元)',
			type: 'number'
		}]
		
		const resultsData = getStatisticsResults(data)
		conf.rows = resultsData.result.map(item => {
			return [
				item.userName,
				item.count,
				toHHMM(item.period),
				item.cost
			]
		})
		conf.rows.push([
			'总计',
			parseInt(resultsData.summary.count),
			resultsData.summary.period,
			parseFloat(resultsData.summary.cost)
		])


		// sheet 2
		let conf2 = {}
		conf2.stylesXmlFile = "./wcm/styles.xml"
		conf2.name = "sheet2"
		conf2.cols = [{
			caption: '姓名',
			type: 'string'
		}, {
			caption: '序号',
			type: 'number'
		}, {
			caption: '开井时间',
			type: 'string'
		}, {
			caption: '关井时间',
			type: 'string'
		}, {
			caption: '耗时',
			type: 'string'
		}, {
			caption: '费用(元)',
			type: 'number'
		}]
		conf2.rows = createSheet2(resultsData.result)
		const result = nodeExcel.execute([conf, conf2])
		res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8')
		res.setHeader("Content-Disposition", "attachment; filename=" + encodeURIComponent(fileName) + ".xlsx")
		res.end(result, 'binary')
	}, res, url)
})

module.exports = app
