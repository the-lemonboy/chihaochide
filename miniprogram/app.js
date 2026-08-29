App({
  globalData: {
    cloudEnv: "prod-d6gkb8nirb8f93b22",
    serviceName: "xiaolinxiaozhengfood"
  },
  onLaunch() {
    wx.cloud.init({ env: "prod-d6gkb8nirb8f93b22", traceUser: true });
  }
})
