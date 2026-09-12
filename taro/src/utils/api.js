import Taro from '@tarojs/taro'
import { placesKey, picksKey } from './storage'

export const API_BASE = 'https://xiaolinxiaozhengfood-304738-11-1477170512.sh.run.tcloudbase.com'

const request = async (path, options = {}) => {
  if (Taro.cloud?.callContainer) {
    const response = await Taro.cloud.callContainer({
      config: { env: 'prod-d8g5iuhjmd3dbd994' },
      path,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'X-WX-SERVICE': 'xiaolinxiaozhengfood',
        'content-type': 'application/json',
      },
    })
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new Error(response.data?.error || `云托管请求失败（${response.statusCode}）`)
    }
    return response.data
  }
  const response = await Taro.request({
    url: `${API_BASE}${path}`,
    timeout: 20000,
    dataType: 'json',
    enableHttp2: false,
    enableQuic: false,
    ...options,
  })
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(response.data?.error || `请求失败（${response.statusCode}）`)
  }
  return response.data
}

export const loadSharedData = async () => {
  const rows = await request('/api/places')
  const places = rows.map(({ selected, ...place }) => place)
  const picks = rows.filter(item => Boolean(item.selected)).map(item => item.id)
  Taro.setStorageSync(placesKey, places)
  Taro.setStorageSync(picksKey, picks)
  return { places, picks }
}

export const addSharedPlace = place => request('/api/places', { method: 'POST', data: place, header: { 'content-type': 'application/json' } })
export const deleteSharedPlace = id => request(`/api/places/${id}`, { method: 'DELETE' })
export const saveSharedPicks = placeIds => request('/api/picks', { method: 'PUT', data: { placeIds }, header: { 'content-type': 'application/json' } })
export const showNetworkError = error => Taro.showToast({
  title: `同步失败：${String(error?.errMsg || error?.message || error || '未知错误').replace('request:fail ', '').slice(0, 38)}`,
  icon: 'none',
  duration: 5000,
})
