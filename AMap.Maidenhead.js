/**
 * AMap.Maidenhead 高德地图梅登黑德网格插件
 */
class Maidenhead {
    constructor(options = {}) {
        this.options = {
            color: 'rgba(255, 0, 0, 0.4)', // 线条和文字颜色
            ...options
        };
        this._map = null;
        this._group = null; // 存储所有网格和标签的覆盖物群组
    }

    // 安装到地图
    addTo(map) {
        this._map = map;
        this._group = new AMap.OverlayGroup();
        this._map.add(this._group);

        // 绑定地图事件：缩放和移动时重绘
        this._map.on('zoomchange', this.redraw, this);
        this._map.on('mapmove', this.redraw, this);

        this.redraw();
        return this;
    }

    // 从地图移除
    remove() {
        if (this._map) {
            this._map.off('zoomchange', this.redraw, this);
            this._map.off('mapmove', this.redraw, this);
            this._map.remove(this._group);
            this._group = null;
            this._map = null;
        }
    }

    redraw() {
        if (!this._map) return;

        // 对应不同缩放级别的步长和参数 (逻辑同原 Leaflet 版)
        const d3 = [20, 10, 10, 10, 10, 10, 1, 1, 1, 1, 1 / 24, 1 / 24, 1 / 24, 1 / 24, 1 / 24, 1 / 240, 1 / 240, 1 / 240, 1 / 240 / 24, 1 / 240 / 24, 1 / 240 / 24];
        const lat_cor = [0, 8, 8, 8, 10, 14, 6, 8, 8, 8, 1.4, 2.5, 3, 3.5, 4, 4, 3.5, 3.5, 1.47, 1.8, 1.6];

        const bounds = this._map.getBounds();
        const zoom = Math.round(this._map.getZoom());
        
        const unit = d3[zoom] || d3[d3.length - 1];
        const lcor = lat_cor[zoom] || lat_cor[lat_cor.length - 1];

        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        let w = sw.lng, e = ne.lng, s = sw.lat, n = ne.lat;
        const c = (zoom === 1) ? 2 : 0.1;

        // 纬度限制
        if (n > 85) n = 85;
        if (s < -85) s = -85;

        const left = Math.floor(w / (unit * 2)) * (unit * 2);
        const right = Math.ceil(e / (unit * 2)) * (unit * 2);
        const top = Math.ceil(n / unit) * unit;
        const bottom = Math.floor(s / unit) * unit;

        this._group.clearOverlays();
        const overlays = [];

        for (let lon = left; lon < right; lon += (unit * 2)) {
            for (let lat = bottom; lat < top; lat += unit) {
                
                // 1. 创建网格矩形
                const rect = new AMap.Rectangle({
                    bounds: new AMap.Bounds([lon, lat], [lon + unit * 2, lat + unit]),
                    strokeColor: this.options.color,
                    strokeWeight: 1,
                    fillOpacity: 0,
                    bubble: true // 事件透传
                });
                overlays.push(rect);

                // 2. 创建坐标文本标签
                const labelPos = [
                    lon + unit - (unit / lcor),
                    lat + (unit / 2) + (unit / lcor * c)
                ];
                overlays.push(this._getLabel(labelPos));
            }
        }
        this._group.addOverlays(overlays);
    }

    _getLabel(lngLat) {
        const title_size = [0, 10, 12, 16, 20, 26, 12, 16, 24, 36, 12, 14, 20, 36, 60, 12, 20, 36, 8, 12, 24];
        const zoom = Math.round(this._map.getZoom());
        const size = (title_size[zoom] || 12) + 'px';

        const locator = this._getLocator(lngLat[0], lngLat[1]);

        // 使用 AMap.Text 代替 Marker 以获得更好的文字显示效果
        return new AMap.Text({
            text: locator,
            position: lngLat,
            offset: new AMap.Pixel(0, 0),
            style: {
                'background-color': 'transparent',
                'border-width': 0,
                'font-size': size,
                'color': this.options.color,
                'font-weight': '900',
                'cursor': 'default'
            }
        });
    }

    _getLocator(lon, lat) {
        const ydiv_arr = [10, 1, 1 / 24, 1 / 240, 1 / 240 / 24];
        const d1 = "ABCDEFGHIJKLMNOPQR".split("");
        const d2 = "ABCDEFGHIJKLMNOPQRSTUVWX".split("");
        const d4 = [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5];

        let locator = "";
        let x = lon;
        let y = lat;

        const zoom = Math.round(this._map.getZoom());
        const precision = d4[zoom] || 5;

        while (x < -180) x += 360;
        while (x > 180) x -= 360;

        x = x + 180;
        y = y + 90;

        locator += d1[Math.floor(x / 20)] + d1[Math.floor(y / 10)];

        for (let i = 0; i < 4; i++) {
            if (precision > i + 1) {
                let rlon = x % (ydiv_arr[i] * 2);
                let rlat = y % (ydiv_arr[i]);

                if ((i % 2) === 0) {
                    locator += Math.floor(rlon / (ydiv_arr[i + 1] * 2)) + "" + Math.floor(rlat / (ydiv_arr[i + 1]));
                } else {
                    locator += d2[Math.floor(rlon / (ydiv_arr[i + 1] * 2))] + "" + d2[Math.floor(rlat / (ydiv_arr[i + 1]))];
                }
            }
        }
        return locator;
    }
}