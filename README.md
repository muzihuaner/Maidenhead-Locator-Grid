# 梅登黑德网格定位 (Maidenhead Grid)
梅登黑德网格 (Maidenhead Grid) 工具：点击地图或输入经纬度即可查看网格、坐标与缩放等级，支持定位与复制信息。
支持：
- 点击地图或输入经纬度自动计算 Maidenhead Grid
- 拖动标记实时更新
- 定位到当前地理位置
- 缩放等级展示




## 高德 梅登黑德网格 插件 (本仓库的 `AMap.Maidenhead.js`)
```html
<script src="https://webapi.amap.com/maps?v=2.0&key=你的Key"></script>
<script src="AMap.Maidenhead.js"></script>
<div id="container"></div>
<script>
  const map = new AMap.Map('container', { zoom: 5, center: [116.397428, 39.90923] });
  const maidenheadGrid = new Maidenhead({ color: 'rgba(0, 100, 255, 0.5)' });
  maidenheadGrid.addTo(map);
</script>
```

