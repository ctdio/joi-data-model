module.exports = function (err) {
  return (err instanceof Error) && (err.isJoi)
}
