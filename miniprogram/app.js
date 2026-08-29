App({
  globalData: {
    cloudEnv: "prod-d8g5iuhjmd3dbd994",
    serviceName: "xiaolinxiaozhengfood"
  },
  onLaunch() {
    wx.cloud.init({ env: "prod-d8g5iuhjmd3dbd994", traceUser: true });
  }
})
