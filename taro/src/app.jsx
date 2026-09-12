import "./app.scss";
import Taro from '@tarojs/taro'

export default function App(props) {
  if (Taro.cloud?.init) Taro.cloud.init({ env: 'prod-d8g5iuhjmd3dbd994', traceUser: true })
  return props.children;
}
