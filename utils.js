exports.formatDate = function (value) {
  return {
    "__type": "Date",
    "iso": value.length > 16 ? value : value + ':00'
  }
}