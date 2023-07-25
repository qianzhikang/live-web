<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <strong>Live</strong>
      </el-header>
      <el-container>
        <el-aside width="15%">
          <el-scrollbar height="100vh">
            <el-menu @select="change" :default-openeds="[0]" default-active="央视-0">
              <el-sub-menu v-for="(val, index) in group" :key="index" :index="index">
                <template #title>
                  {{ val }}
                </template>
                <el-menu-item v-for="(name, index) in dataObj.groupedData[val]" :key="index" :index="val + '-' + index">
                  {{ name.tvgName }}
                </el-menu-item>
              </el-sub-menu>
            </el-menu>
          </el-scrollbar>
        </el-aside>
        <el-container>
          <el-main>
            <!-- 播放器 -->
            <div id="mui-player"></div>
          </el-main>
          <el-footer>@虚以待位</el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { toRaw, ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import 'mui-player/dist/mui-player.min.css'
import MuiPlayer from 'mui-player'
import Hls from 'hls.js'
// m3u文件源list
const list = ref()
// 未进行分类的节目列表
const programs = reactive([])
// 节目分类
const group = reactive([])
// 处理后的节目对象数组，key=节目分类，value=对应分类的节目对象数组
const dataObj = reactive({})
// 当前选择的节目对象的url
const programUrl = ref()
// 当前选择的节目对象的名字
const programName = ref()
// 播放器实例
let mp = {}
onMounted(() => {
  // 获取直播列表
  fetch('https://live.fanmingming.com/tv/m3u/global.m3u')
    .then(res => res.text())
    .then(data => {
      list.value = data
      // 解析结果
      resolveInfo(list.value)
    })
    .catch(error => {
      console.error('Error fetching or parsing M3U file:', error)
    })
  // 初始化播放器默认为cctv1
  mp = new MuiPlayer({
    container: '#mui-player',
    title: 'cctv1',
    src: '/live?auth=2307100804&id=cctv1',
    height: '100%',
    live: true,
    parse: {
      type: 'hls',
      loader: Hls,
      config: {
        debug: false
      }
    }
  })
})
// 解析文本
const resolveInfo = text => {
  // 正则
  const regex = /^#EXTINF:-1.*tvg-id="([^"]*)" tvg-name="([^"]*)" tvg-logo="([^"]*)" group-title="([^"]*)"/
  const items = text.split('\n')
  // 循环处理，将节目列表结构化处理
  items.forEach((value, index) => {
    const matches = regex.exec(value)
    if (matches != null) {
      const [, tvgId, tvgName, tvgLogo, groupTitle] = matches
      const url = items[index + 1]
      const item = {
        tvgId,
        tvgName,
        tvgLogo,
        groupTitle,
        url
      }
      programs.push(item)
    }
  })
  // 处理节目分类
  const groupedData = toRaw(programs).reduce((result, item) => {
    const groupTitle = item.groupTitle
    if (!result[groupTitle]) {
      result[groupTitle] = []
      group.push(groupTitle)
    }
    result[groupTitle].push(item)
    return result
  }, {})
  dataObj.groupedData = groupedData
}
// 换台
const change = (key) => {
  // 销毁播放器释放资源
  mp.destroy()
  // 解析所选节目的信息 todo 图片等也可以在这里处理
  const [val, idx] = key.split('-')
  const url = dataObj.groupedData[val][idx].url
  programUrl.value = url.substring(url.lastIndexOf('/'))
  programName.value = dataObj.groupedData[val][idx].tvgName

  // 重新初始化视频播放器
  mp = new MuiPlayer({
    container: '#mui-player',
    title: programName.value,
    src: programUrl.value,
    height: '100%',
    live: true,
    parse: {
      type: 'hls',
      loader: Hls,
      config: {
        debug: false
      }
    }
  })
}
// 销毁播放器，释放资源
onBeforeUnmount(() => {
  mp.destroy()
})
</script>

<style>
.el-header,
.el-footer {
  background-color: #B3C0D1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #D3DCE6;
  color: #333;
  text-align: center;
  line-height: 200px;
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
  text-align: center;
}
</style>
