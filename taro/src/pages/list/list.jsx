import { useState } from 'react'
import { View, Text, Input, Button, Navigator } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { iconFor } from '../../utils/storage'
import { addSharedPlace, deleteSharedPlace, loadSharedData, saveSharedPicks, showNetworkError } from '../../utils/api'

export default function List() {
  const [p, setP] = useState([])
  const [pick, setPick] = useState([])
  const [name, setName] = useState('')
  const [tag, setTag] = useState('')

  const refresh = async () => {
    try {
      const data = await loadSharedData()
      setP(data.places)
      setPick(data.picks)
    } catch (error) { console.error('load shared data failed', error); showNetworkError(error) }
  }
  useDidShow(() => { refresh() })

  const toggle = async id => {
    const old = pick
    const next = old.includes(id) ? old.filter(x => x !== id) : [...old, id]
    setPick(next)
    try { await saveSharedPicks(next) } catch (error) { setPick(old); showNetworkError(error) }
  }

  const add = async () => {
    if (!name.trim()) return
    const draft = { name: name.trim(), tag: tag.trim() || '未分类', emoji: iconFor(tag), color: ['peach', 'yellow', 'lavender', 'mint', 'blue'][p.length % 5] }
    try {
      const created = await addSharedPlace(draft)
      setP([...p, created])
      setName('')
      setTag('')
    } catch (error) { showNetworkError(error) }
  }

  const remove = async id => {
    try {
      await deleteSharedPlace(id)
      setP(p.filter(x => x.id !== id))
      setPick(pick.filter(x => x !== id))
    } catch (error) { showNetworkError(error) }
  }

  return <View className='shell'>
    <View className='topbar'><Text className='brand'>📒 美食清单</Text><Navigator url='/pages/index/index' className='link'>回到选择 ({pick.length}) →</Navigator></View>
    <View className='hero'><Text className='eyebrow'>MY FOOD LIBRARY</Text><Text className='title'>把想吃的，<Text className='pink'>先记下来。</Text></Text></View>
    <View className='card'>
      <View className='section'><Text className='heading'>我的美食收藏</Text><Text className='count'>{p.length} 家</Text></View>
      {p.map(x => <View className={'place ' + x.color} key={x.id}><Text className='food'>{x.emoji}</Text><View className='copy'><Text className='name'>{x.name}</Text><Text className='muted'>{x.tag}</Text></View><Button className={'candidate ' + (pick.includes(x.id) ? 'active' : '')} onClick={() => toggle(x.id)}>{pick.includes(x.id) ? '已选中 ✓' : '加入选择'}</Button><Button className='delete' onClick={() => remove(x.id)}>×</Button></View>)}
      <View className='form'><Text className='formtitle'>再记一家</Text><Input placeholder='店名或想吃的美食' value={name} onInput={e => setName(e.detail.value)} /><Input placeholder='随手写个类型（可选）' value={tag} onInput={e => setTag(e.detail.value)} /><Button className='drawbtn' onClick={add}>＋ 放进清单</Button></View>
    </View>
  </View>
}
