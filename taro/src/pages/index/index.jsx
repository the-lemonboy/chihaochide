import { useState } from 'react'
import { View, Text, Button, Navigator } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { loadSharedData, saveSharedPicks, showNetworkError } from '../../utils/api'

export default function Index() {
  const [places, setPlaces] = useState([])
  const [picks, setPicks] = useState([])
  const [result, setResult] = useState(null)
  const [show, setShow] = useState(false)

  const refresh = async () => {
    try {
      const data = await loadSharedData()
      setPlaces(data.places)
      setPicks(data.picks)
    } catch (error) { console.error('load shared data failed', error); showNetworkError(error) }
  }
  useDidShow(() => { refresh() })

  const toggle = async id => {
    const old = picks
    const next = old.includes(id) ? old.filter(x => x !== id) : [...old, id]
    setPicks(next)
    try { await saveSharedPicks(next) } catch (error) { setPicks(old); showNetworkError(error) }
  }
  const pool = places.filter(x => picks.includes(x.id))
  const reroll = () => setResult(pool[Math.floor(Math.random() * pool.length)])

  return <View className='shell'>
    <View className='topbar'><Text className='brand'>🥢 小林小郑吃好吃的</Text><View className='nav'><Navigator url='/pages/list/list' className='link'>看看收藏</Navigator><Text className='plus' onClick={() => setShow(true)}>＋</Text></View></View>
    <View className='hero'><Text className='eyebrow'>FOOD MOOD · 01</Text><Text className='title'>今天，<Text className='pink'>吃啥好吃的呢</Text></Text></View>
    <View className='card'><View className='section'><Text className='heading'>想吃什么</Text><Text className='count'>{picks.length} 家</Text></View>{pool.map(p => <View className={'place ' + p.color + ' chosen'} key={p.id} onClick={() => toggle(p.id)}><Text className='food'>{p.emoji}</Text><View className='copy'><Text className='name'>{p.name}</Text><Text className='muted'>{p.tag}</Text></View><Text className='check'>✓</Text></View>)}{!pool.length && <View className='empty'>🍽️<Text>候选席位空着，等你点名</Text></View>}</View>
    <View className='draw'><View className='ticket'>已选好 {picks.length} 家店　·　剩下的交给骰子</View><Button className='drawbtn' disabled={!pool.length} onClick={reroll}>🎲 随便挑一家</Button></View>
    {show && <View className='mask'><View className='modal picker-modal'><View className='picker-head'><Text className='resultname'>挑几家候选</Text><Text className='modal-x' onClick={() => setShow(false)}>×</Text></View>{places.map(p => <View className={'place ' + p.color + (picks.includes(p.id) ? ' chosen' : '')} key={p.id} onClick={() => toggle(p.id)}><Text className='food'>{p.emoji}</Text><Text className='name'>{p.name}</Text><Text className='check'>{picks.includes(p.id) ? '✓' : ''}</Text></View>)}<Button className='drawbtn' onClick={() => setShow(false)}>就这些了（{picks.length} 家）</Button><Navigator url='/pages/list/list' className='pink'>再去收藏点新东西 →</Navigator></View></View>}
    {result && <View className='mask' onClick={() => setResult(null)}><View className='modal' onClick={e => e.stopPropagation()}><Text className='eyebrow'>TODAY'S PICK</Text><Text className='resultfood'>{result.emoji}</Text><Text className='muted'>抽到的是</Text><Text className='resultname'>{result.name}</Text><Text className='muted'>{result.tag}</Text><Button className='again' onClick={reroll}>再来一次吧</Button><Button onClick={() => setResult(null)}>行，就它了</Button></View></View>}
  </View>
}
