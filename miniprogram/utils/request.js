const app = getApp();
export function request(options) {
  wx.cloud.callContainer({
    config: { env: app.globalData.cloudEnv },
    path: options.url,
    method: options.method || "GET",
    data: options.data,
    header: { ...(options.header || {}), "X-WX-SERVICE": app.globalData.serviceName },
    success(res) {
      let data = res.result;
      if (typeof data === "string") { try { data = JSON.parse(data); } catch (_) {} }
      if (res.statusCode && res.statusCode >= 400) {
        options.fail?.({ errMsg: `云托管返回 ${res.statusCode}`, ...res, data });
        return;
      }
      options.success?.({ ...res, data });
    },
    fail: (err) => { console.error("callContainer failed", err); options.fail?.(err); },
  });
}
