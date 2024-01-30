// ==UserScript==
// @name         My Userscript
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @grant        none
// @run-at       document-end
// @match        https://paipai.m.jd.com/*
// @require      https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.min.js
// @require      http://andywer.github.io/threadpool-js/dist/threadpool.min.js
// @require      https://cdn.staticfile.org/axios/0.18.0/axios.min.js
// ==/UserScript==

(function () {
    'use strict';


    let crackApp = document.createElement("div");
    crackApp.id = "crackDbd";
    document.body.appendChild(crackApp);

    const comMain = {
        template: `

          <div style="position: fixed;z-index: 999;top: 0;right: 0;">
            <div style="float: right;">
              <div @click="hide = !hide"
                   style="width: 46px;height: 46px;color: rgba(0,0,0,0.3);line-height: 46px;text-align: center;background-color: rgba(255, 255, 255, 0.8);margin-bottom: 6px;border-radius: 50%;font-size: 2vh;">
                x
              </div>
            </div>
            <div style="background-color: white;float: right;" v-show="hide">
              <div
                  style="display: flex;align-items: center;justify-content: space-around;flex-direction: column;height: 510px;">
                <div style="width: 100%;display: flex;align-items: center;justify-content: center;">
                  <span style="width: 10%;display: inline-block;font-size: .39rem;">固定出价</span>
                  <input type='number'
                         style="width: 20%;height: 18px;display: inline-block;text-align: center;line-height: .6rem;font-size: .6rem;"
                         v-model.number="stableOfferPrice"
                         placeholder="若填写，则固定金额出价"/>
                  <span
                      style="width: 10%;display: inline-block;font-size: .39rem;margin-left: .6rem;">限制上限</span>
                  <input type='number'
                         style="width: 20%;height: 18px;display: inline-block;text-align: center;line-height: .6rem;font-size: .6rem;"
                         v-model.number="maxOfferPrice"
                         placeholder="限制出价上限，仅在输入了“匹配出价”时生效"/>
                  <span
                      style="width: 10%;display: inline-block;font-size: .39rem;margin-left: .6rem;">限制下限</span>
                  <input type='number'
                         style="width: 20%;height: 18px;display: inline-block;text-align: center;line-height: .6rem;font-size: .6rem;"
                         v-model.number="minOfferPrice"
                         placeholder="限制出价下限，全局生效"/>
                </div>
                <div style="width: 100%;display: flex;align-items: center;justify-content: center;">
                  <span style="width: 10%;display: inline-block;font-size: .39rem;">出价延时</span>
                  <input type='number'
                         style="width: 20%;height: 18px;display: inline-block;text-align: center;line-height: .6rem;font-size: .6rem;"
                         v-model.number="delay"
                         placeholder="请输入出价延时"/>
                  <span
                      style="width: 10%;display: inline-block;font-size: .39rem;margin-left: .6rem;">加价金额</span>
                  <input
                      style="width: 20%;height: 18px;display: inline-block;text-align: center;line-height: .6rem;font-size: .6rem;"
                      v-model="priceIncrease"
                      placeholder="请输入加价金额"/>
                  <span
                      style="width: 10%;display: inline-block;font-size: .39rem;margin-left: .6rem;">底价偏移</span>
                  <input type='number'
                         style="width: 20%;height: 18px;display: inline-block;text-align: center;line-height: .6rem;font-size: .6rem;"
                         v-model.number="offset"
                         placeholder="请输入底价偏移"/>
                </div>
                <div style="width: 100%;display: flex;align-items: center;justify-content: center;">
                <span
                    style="width: 10%;display: inline-block;font-size: .39rem;">非关键词</span>
                  <textarea
                      style="width: 90%;height: 40px;display: inline-block;line-height: .6rem;font-size: .6rem;"
                      v-model="unWord"
                      placeholder="匹配到非关键词则不出价(“ ”匹配或非关键词)">
                </textarea>
                </div>
                <div style="width: 100%;display: flex;align-items: center;justify-content: center;">
                <span
                    style="width: 10%;display: inline-block;font-size: .39rem;">匹配出价</span>
                  <textarea
                      style="width: 90%;height: 40px;display: inline-block;line-height: .6rem;font-size: .6rem;"
                      v-model="matchWord"
                      placeholder="匹配到非关键词则出价(“ ”匹配或关键词，“&”匹配与关键词)">
                </textarea>
                </div>
                <!-- 复选框 -->
                <div>
                  <div v-for="item in checkBoxList" :key="item.value"
                       style="width: 100%;height: 40px;display: flex;align-items: center;justify-content: center;">
                    <label style="width: 100%;display: flex;align-items: center;justify-content: center;">
                      <input @click="clickCheckBox(item.label)" name="Fruit" type="checkbox"
                             :value="item.value" :checked="matchWord===item.label"/>
                      <div>{{ item.label }}</div>
                    </label>
                  </div>
                </div>
                <!-- 单选框-->
                <div class="box"
                     style="width: 100%;height: 40px;display: flex;justify-content: space-evenly;">
                  <div v-for="(item,index) in radioList" :key="index">
                    <input style="display: inline;" type="checkbox" name="gender" :value="item.value" :id="item.value"
                           :checked="offerModel.includes(item.value)" @click="clickRadio(item.value)"/>
                    <label :for="item.value">
                      {{ item.label }}
                    </label>
                  </div>
                </div>

                <div style="width: 100%;display: flex;justify-content: space-between;">
                  <button @click="onSave"
                          style="width: 46%;height: 50px;border-radius: 30px;text-align: center;line-height: 38px;margin: 1%;border-width: 1px;font-size: 0.89733rem;">
                    启&nbsp;&nbsp;&nbsp;&nbsp;动
                  </button>
                  <button @click="onDelete"
                          style="width: 46%;height: 50px;border-radius: 30px;text-align: center;line-height: 38px;margin: 1%;border-width: 1px;font-size: 0.89733rem;">
                    取&nbsp;&nbsp;&nbsp;&nbsp;消
                  </button>
                </div>
                <div v-show="message" style="color: red;text-align: center;">{{ message }}</div>
              </div>
            </div>
          </div>

        `,
        data() {
            return {
                maxOfferPrice: 0,
                minOfferPrice: 199,
                priceIncrease: "1-3",
                offset: 0,
                stableOfferPrice: 0,
                delay: 800,
                unWord: "赠品 非卖 保护套 海蓝 霜 露 液 沫 手机壳",
                matchWord: "",
                message: "",
                go: 0,
                hide: false,
                checkBoxList: [
                    {
                        value: "0",
                        label: "飞利浦 破壁机 空气炸锅 洗脸仪 消毒"
                    },
                    {
                        value: "1",
                        label: "耳机 iPhone 手机 iPad 平板 智能&手表"
                    },
                    {
                        value: "2",
                        label: "婴儿 羽绒服&男 衣&男 外套&男 裤&男 鞋&44"
                    },
                    {
                        value: "3",
                        label: "surface 笔记本 电脑"
                    },
                    {
                        value: "4",
                        label: "iPhone&15&Pro&max&512"
                    },
                ],
                offerModel: [0],
                radioList: [
                    {
                        value: 0,
                        label: "列表中获取"
                    },
                    {
                        value: 1,
                        label: "提醒中获取"
                    },
                    {
                        value: 2,
                        label: "出价中获取"
                    },
                ],
                m: new Map(),
                auctionInfos: [],
            }
        },
        methods: {
            onSave() {
                axios.defaults.timeout = 1000;
                axios.defaults.withCredentials = true; //配置为true
                let pool = new ThreadPool();
                // 参数加密
                this.go = setInterval(async () => {
                    if (this.offerModel.includes(0)) { // 列表查询
                        const listRsp = await axios.get('https://api.m.jd.com/api', {
                            params: {
                                'functionId': 'dbd.auction.list.v2',
                                'body': '{"pageNo":1,"pageSize":6,"brandList":"","qualityList":"","status":"","auctionFilterTime":0,"groupId":"","topAuctionId":null,"isPersonalRecommend":0,"p":2,"skuGroup":1,"productTypes":1,"mpSource":1,"sourceTag":2}',
                                'appid': 'paipai_h5'
                            }
                        });
                        let arr = listRsp.data.result.data.auctionInfos
                        for (let i in arr) {
                            if (!this.m.has(arr[i].id)) {
                                //占位价格默认0
                                this.m.set(arr[i].id, 0)
                                this.auctionInfos.push(arr[i])
                            }
                        }
                    }
                    if (this.offerModel.includes(1)) {//提醒查询
                        const listRsp = await axios.get('https://api.m.jd.com/api', {
                            params: {
                                'functionId': 'paipai.dbd.reminder.auctionList',
                                'body': '{"readStatus":"","endStatus":"0","pageNo":1,"pageSize":60,"mpSource":1,"sourceTag":2}',
                                'appid': 'paipai_h5'
                            }
                        });
                        let arr = listRsp.data.result.data.pageList
                        for (let i in arr) {
                            if (arr[i].status === 2 && !this.m.has(arr[i].id)) {
                                //占位价格默认0
                                this.m.set(arr[i].id, 0)
                                this.auctionInfos.push(arr[i])
                            }
                        }
                    }
                    if (this.offerModel.includes(2)) {//已出价
                        const listRsp = await axios.get('https://api.m.jd.com/api', {
                            params: {
                                'functionId': 'dbd.record.myRecords',
                                'body': '{"showStatus":-1,"pageSize":20,"pageNum":1,"p":2,"even":true,"mpSource":1,"sourceTag":2}',
                                'appid': 'paipai_h5'
                            }
                        });
                        let arr = listRsp.data.result.data.bidRecordList;
                        for (let i in arr) {
                            if (arr[i].status === 1 && !arr[i].currentPrice && !this.m.has(arr[i].auctionId)) {
                                //占位价格默认0
                                this.m.set(arr[i].auctionId, 0)
                                this.auctionInfos.push(arr[i])
                            }
                        }
                    }
                    for (let i = 0; i < this.auctionInfos.length; i++) {
                        try {
                            // 限制出价下限，原价小于指定下限则不参与竞拍
                            if (this.auctionInfos[i].cappedPrice < this.minOfferPrice) continue;
                            let auctionId = this.auctionInfos[i].auctionId || this.auctionInfos[i].id;
                            // 距离结束剩10秒才加入抢拍队列
                            let end = this.auctionInfos[i].endTime - Date.now();
                            if (end < 0) {
                                this.m.delete(auctionId)
                                this.auctionInfos.splice(i, 1)
                                continue
                            }
                            if (end > 38000) continue;
                            // 若未配置关键词，则监控所有商品；若匹配到关键词则设置为用户配置的最大出价金额,且仅监控带关键词的商品。
                            let productName = this.auctionInfos[i].productName;
                            let min;
                            if (this.matchWord === '') {
                                min = await this.getMinPrice(auctionId);
                            } else if (this.isIncludes(productName)) {
                                if (this.maxOfferPrice === 0) {
                                    min = await this.getMinPrice(auctionId);
                                } else {
                                    min = this.maxOfferPrice;
                                }
                            } else {
                                continue;
                            }
                            //若为整数，则直接偏移整数价格；若为小数，则偏移小数乘以最小出价金额的价格
                            this.m.set(auctionId, parseInt(this.offset) === parseFloat(this.offset) ? min + this.offset : min + min * this.offset);
                            //开始任务
                            pool
                                .run((param, done) => {
                                    (async () => {
                                        let res = await fetch("https://api.m.jd.com/api?functionId=paipai.auction.get_current_and_offerNum&t=" + Date.now() + "&appid=paipai_h5", {
                                            "credentials": "include",
                                            "headers": {
                                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/112.0",
                                                "Accept": "*/*",
                                                "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
                                                "Sec-Fetch-Dest": "empty",
                                                "Sec-Fetch-Mode": "no-cors",
                                                "Sec-Fetch-Site": "same-site",
                                                "content-type": "application/x-www-form-urlencoded",
                                                "x-referer-page": "https://paipai.m.jd.com/ppdbd/pages/detail/index",
                                                "x-rp-client": "h5_1.0.0",
                                                "Pragma": "no-cache",
                                                "Cache-Control": "no-cache"
                                            },
                                            "referrer": "https://paipai.m.jd.com/",
                                            "body": "body=%7B%22auctionId%22:%22" + param[4] + "%22,%22mpSource%22:1,%22sourceTag%22:2%7D",
                                            "method": "POST",
                                            "mode": "cors"
                                        });
                                        let jsonData = await res.json();
                                        let offerTime = jsonData.result.data.actualEndTime - Date.now() - param[3];
                                        setTimeout(async () => {
                                            let res = await fetch("https://api.m.jd.com/api?functionId=paipai.auction.get_current_and_offerNum&t=" + Date.now() + "&appid=paipai_h5", {
                                                "credentials": "include",
                                                "headers": {
                                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/112.0",
                                                    "Accept": "*/*",
                                                    "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
                                                    "Sec-Fetch-Dest": "empty",
                                                    "Sec-Fetch-Mode": "no-cors",
                                                    "Sec-Fetch-Site": "same-site",
                                                    "content-type": "application/x-www-form-urlencoded",
                                                    "x-referer-page": "https://paipai.m.jd.com/ppdbd/pages/detail/index",
                                                    "x-rp-client": "h5_1.0.0",
                                                    "Pragma": "no-cache",
                                                    "Cache-Control": "no-cache"
                                                },
                                                "referrer": "https://paipai.m.jd.com/",
                                                "body": "body=%7B%22auctionId%22:%22" + param[4] + "%22,%22mpSource%22:1,%22sourceTag%22:2%7D",
                                                "method": "POST",
                                                "mode": "cors"
                                            });
                                            let jsonData = await res.json();
                                            let currentPrice = jsonData.result.data.currentPrice;
                                            // 判断是否固定价格出价
                                            let offerPrice
                                            if (param[2] === 0) {
                                                offerPrice = currentPrice + param[1]
                                            } else {
                                                offerPrice = param[2]
                                            }
                                            if (currentPrice === null) offerPrice = 0;
                                            if (currentPrice > param[0]) offerPrice = 0;
                                            let priceBody = 'address=19-1607-4773-62122&auctionId=' + param[4] + '&entryid=&price=' + offerPrice + '&trackId=&eid=ZH62NVZXFHVBIMN5EUDTDWDBDGWE7FE6MMX2RXO65RUWXACGTJIZ5BS5FCU42MCYCGACXEBSPKCXDRIETUNG4DVMPM&fp=62888e893a17d91eaa7ad146eab9aaa3&p=2&token=phzn1gvh8g5ebct6hwu1608302936875uky5~NmZeSyVEbFNSd3d1d1FZA3p8AQ5nRHpTBiUjb35DFm5vLUROOBEzLUF7G28iAAFBKBgVFA1EPwIVKDclGENXbm8iVlQiAwpTTx1lKSsTCG5vfmsaDUR6LUEnG29%2BPU8KLHMHDGUCYERaeX4vcwQPA3V0Ago1BGFBWnkhfiJUVV97JgNkc0oKUwoyKhFmWzEQOTZCXQ1Eei1BKTQ5GENXbm80VlEhBz9fDm8tKWoCAl8RZhtkcxY4LUF7G29rDEJALC1EXQ4HIxIXKCgjagkZXyEYFRQNRCYFP2N9EWYJGUY9Nw1kc0oKUxMoG29%2BPU8Hf2gGDn1eekVPcWt8c1QxEDBmGxo0AjICBGN9bzBXCFxvaBVbIkRsUw80dXpzDV5KNC5UTiADOR0ZJC01N1RfBX4iXQg5AyYXEHk2emZNT1FvfhVIZ18mHRl5PXQ2BwcCfXRFVCkfZ0dTdHd8cFlfAXpxBUw7DG9TT2MjPipDVxA0JQUNNV81C0FtZSQ3Q1cQfGYbGjsPNVNZY350fVlPTw%3D%3D%7C~1608304185632~1~20201218~eyJ2aXdlIjoiMCIsImJhaW4iOnt9fQ%3D%3D~2~515~1pl4%7Cgw4w%3B5d4ae-qz%2C1j3%2C%2C%3B5dmu-me%2C1ii%2C%2C%3Bdoei%3A%2C1%2C413%2C413%2C0%2C0%2C1%2C1%2C0%2C0%3Bdmei%3A%2C1%2C413%2C0%2C0%2C0%2C0%2C0%2C0%2C0%3Bemc%3A%2Cd%3A1%3Bemmm%3A%3Bemcf%3A%2Cd%3A1%3Bivli%3A%3Biivl%3A%3Bivcvj%3A%3Bscvje%3A%3Bewhi%3A%3B1608304178659%2C1608304185628%2C0%2C0%2C3%2C3%2C0%2C1%2C0%2C0%2C0%3Btt4b&initFailed=false';//提交价格请求体
                                            done([priceBody, offerPrice]);
                                        }, offerTime)
                                    })();
                                }, [this.m.get(auctionId), this.randomPrice(parseInt(this.priceIncrease.split('-')[0]), parseInt(this.priceIncrease.split('-')[1])), this.stableOfferPrice, this.delay, auctionId])
                                .done(result => {
                                    if (result[1] === 0) {
                                        this.message = "并未出价：超过了近期最低价！";
                                    } else {
                                        axios({
                                            url: 'https://used-api.jd.com/auctionRecord/offerPrice',
                                            method: 'post',
                                            data: result[0],
                                        }).then(res => {
                                            this.message = "请求结果：" + res.data.message;
                                        })
                                    }
                                    this.m.delete(auctionId)
                                    this.auctionInfos.splice(i, 1)
                                });
                        } catch (error) {
                            console.error(`Error fetching:`, error.message);
                            continue; // 出现错误，但继续下一次循环
                        }
                    }
                }, 30000);
                this.message = "启动"
            },
            onDelete() {
                this.m = new Map()
                this.auctionInfos = []
                clearInterval(this.go);
                this.message = "取消"
            },
            getSign() {

                var t = new window.ParamsSign({
                    'appId': '86b9f',
                    'debug': !1,
                    'preRequest': !1,
                    'onSign': function onSign(e) {
                        e.code
                    },
                    'onRequestTokenRemotely': function onRequestTokenRemotely(e) {
                        e.code,
                            e.message
                    },
                    'onRequestToken': function onRequestToken(e) {
                        e.code,
                            e.message
                    }
                });

                const p = {
                    'sha256_digest': function SHA256(e) {
                        function safe_add(e, t) {
                            var n = (65535 & e) + (65535 & t);
                            return (e >> 16) + (t >> 16) + (n >> 16) << 16 | 65535 & n
                        }

                        function S(e, t) {
                            return e >>> t | e << 32 - t
                        }

                        function R(e, t) {
                            return e >>> t
                        }

                        function Ch(e, t, n) {
                            return e & t ^ ~e & n
                        }

                        function Maj(e, t, n) {
                            return e & t ^ e & n ^ t & n
                        }

                        function Sigma0256(e) {
                            return S(e, 2) ^ S(e, 13) ^ S(e, 22)
                        }

                        function Sigma1256(e) {
                            return S(e, 6) ^ S(e, 11) ^ S(e, 25)
                        }

                        function Gamma0256(e) {
                            return S(e, 7) ^ S(e, 18) ^ R(e, 3)
                        }

                        return function binb2hex(e) {
                            for (var t = '', n = 0; n < 4 * e.length; n++) t += '0123456789abcdef'.charAt(e[n >> 2] >> 8 * (3 - n % 4) + 4 & 15) + '0123456789abcdef'.charAt(e[n >> 2] >> 8 * (3 - n % 4) & 15);
                            return t
                        }(
                            function core_sha256(e, t) {
                                var n,
                                    r,
                                    o,
                                    a,
                                    i,
                                    c,
                                    s,
                                    u,
                                    l,
                                    p,
                                    d,
                                    f = new Array(
                                        1116352408,
                                        1899447441,
                                        3049323471,
                                        3921009573,
                                        961987163,
                                        1508970993,
                                        2453635748,
                                        2870763221,
                                        3624381080,
                                        310598401,
                                        607225278,
                                        1426881987,
                                        1925078388,
                                        2162078206,
                                        2614888103,
                                        3248222580,
                                        3835390401,
                                        4022224774,
                                        264347078,
                                        604807628,
                                        770255983,
                                        1249150122,
                                        1555081692,
                                        1996064986,
                                        2554220882,
                                        2821834349,
                                        2952996808,
                                        3210313671,
                                        3336571891,
                                        3584528711,
                                        113926993,
                                        338241895,
                                        666307205,
                                        773529912,
                                        1294757372,
                                        1396182291,
                                        1695183700,
                                        1986661051,
                                        2177026350,
                                        2456956037,
                                        2730485921,
                                        2820302411,
                                        3259730800,
                                        3345764771,
                                        3516065817,
                                        3600352804,
                                        4094571909,
                                        275423344,
                                        430227734,
                                        506948616,
                                        659060556,
                                        883997877,
                                        958139571,
                                        1322822218,
                                        1537002063,
                                        1747873779,
                                        1955562222,
                                        2024104815,
                                        2227730452,
                                        2361852424,
                                        2428436474,
                                        2756734187,
                                        3204031479,
                                        3329325298
                                    ),
                                    m = new Array(
                                        1779033703,
                                        3144134277,
                                        1013904242,
                                        2773480762,
                                        1359893119,
                                        2600822924,
                                        528734635,
                                        1541459225
                                    ),
                                    g = new Array(64);
                                e[t >> 5] |= 128 << 24 - t % 32,
                                    e[15 + (t + 64 >> 9 << 4)] = t;
                                for (var y = 0; y < e.length; y += 16) {
                                    n = m[0],
                                        r = m[1],
                                        o = m[2],
                                        a = m[3],
                                        i = m[4],
                                        c = m[5],
                                        s = m[6],
                                        u = m[7];
                                    for (var b = 0; b < 64; b++) g[b] = b < 16 ? e[b + y] : safe_add(
                                        safe_add(
                                            safe_add(S(d = g[b - 2], 17) ^ S(d, 19) ^ R(d, 10), g[b - 7]),
                                            Gamma0256(g[b - 15])
                                        ),
                                        g[b - 16]
                                    ),
                                        l = safe_add(
                                            safe_add(safe_add(safe_add(u, Sigma1256(i)), Ch(i, c, s)), f[b]),
                                            g[b]
                                        ),
                                        p = safe_add(Sigma0256(n), Maj(n, r, o)),
                                        u = s,
                                        s = c,
                                        c = i,
                                        i = safe_add(a, l),
                                        a = o,
                                        o = r,
                                        r = n,
                                        n = safe_add(l, p);
                                    m[0] = safe_add(n, m[0]),
                                        m[1] = safe_add(r, m[1]),
                                        m[2] = safe_add(o, m[2]),
                                        m[3] = safe_add(a, m[3]),
                                        m[4] = safe_add(i, m[4]),
                                        m[5] = safe_add(c, m[5]),
                                        m[6] = safe_add(s, m[6]),
                                        m[7] = safe_add(u, m[7])
                                }
                                return m
                            }(
                                function str2binb(e) {
                                    for (var t = Array(), n = 0; n < 8 * e.length; n += 8) t[n >> 5] |= (255 & e.charCodeAt(n / 8)) << 24 - n % 32;
                                    return t
                                }(
                                    e = function Utf8Encode(e) {
                                        e = e.replace(/\r\n/g, '\n');
                                        for (var t = '', n = 0; n < e.length; n++) {
                                            var r = e.charCodeAt(n);
                                            r < 128 ? t += String.fromCharCode(r) : r > 127 &&
                                            r < 2048 ? (
                                                t += String.fromCharCode(r >> 6 | 192),
                                                    t += String.fromCharCode(63 & r | 128)
                                            ) : (
                                                t += String.fromCharCode(r >> 12 | 224),
                                                    t += String.fromCharCode(r >> 6 & 63 | 128),
                                                    t += String.fromCharCode(63 & r | 128)
                                            )
                                        }
                                        return t
                                    }(e)
                                ),
                                8 * e.length
                            )
                        )
                    }
                }

                return {t, p}
            },
            async getMinPrice(auctionId) {
                var reSign = this.getSign();
                let t = (new Date).getTime();
                let body = `{"auctionId":"${auctionId}","auctionProductType":1,"p":2,"ts":${t},"dbdApiVersion":"20200623","mpSource":1,"sourceTag":2}`;
                var C = {
                    'functionId': 'dbd.auction.detail.v2',
                    't': t,
                    'appid': 'paipai_h5',
                    'body': reSign.p.sha256_digest(body).toString()
                }
                var a = await reSign.t.sign(C);
                // 商品详情查询
                let uuid = this.getCookieUUID("__jda");
                const detailRsp = await axios.post(
                    'https://api.m.jd.com/api',
                    `body=${body}&h5st=${a.h5st}`,
                    {
                        params: {
                            'functionId': 'dbd.auction.detail.v2',
                            'x-api-eid-token': jdtRiskContext.deviceInfo.jsToken,
                            'appid': 'paipai_h5',
                            'uuid': uuid,
                            't': t
                        },
                    }
                );
                console.log(detailRsp)
                let usedNo = detailRsp.data.result.data.auctionInfo.usedNo;
                // 历史价查询
                const historyRsp = await axios.post(
                    'https://api.m.jd.com/api',
                    `body={"usedNo":"${usedNo}","mpSource":1,"sourceTag":2}`,
                    {
                        params: {
                            'functionId': 'dbd.auction.detail.history',
                            'appid': 'paipai_h5',
                            'uuid': uuid
                        },
                    }
                );
                let offerPriceHistory = historyRsp.data.result.data
                // 计算最小出价金额，没记录取原价的百分之十、有记录取最小记录
                let min;
                if (offerPriceHistory.length <= 5) {
                    min = detailRsp.data.result.data.auctionInfo.cappedPrice * 0.1;
                } else {
                    const arr = offerPriceHistory.map(({offerPrice}) => offerPrice);
                    min = Math.min.apply(null, arr);
                }
                return min;
            },
            isIncludes(productName) {
                // 校验是否包含关键词
                let pName = productName.toUpperCase();
                let mWord = this.matchWord.toUpperCase();
                if (this.unWord !== '' && this.unWord.split(" ").some(s1 => pName.includes(s1))) return false;
                return mWord.split(" ").some(str => str.split("&").every(s1 => pName.includes(s1)));
            },
            randomPrice(minimum, maximum) {
                // 校验是否包含关键词
                return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
            },
            clickCheckBox(val) {
                if (this.matchWord === val) {
                    this.matchWord = ""
                } else {
                    this.matchWord = val
                }
                // if (this.matchWord.includes(val)) {
                //     this.matchWord.splice(this.matchWord.indexOf(val), 1);
                // } else {
                //     this.matchWord.push(val);
                // }

            },
            clickRadio(val) {
                if (this.offerModel.includes(val)) {
                    this.offerModel.splice(this.offerModel.indexOf(val), 1);
                } else {
                    this.offerModel.push(val);
                }
            },
            getCookieUUID(val) {
                try {
                    var regexPattern = new RegExp(`(?:(?:^|.*;\\s*)${val}\\s*\\=\\s*([^;]*).*$)|^.*$`)
                    var e = document.cookie.replace(regexPattern, "$1")
                        , t = e && e.split(".");
                    return Array.isArray(t) && t.length > 1 ? t[0] ? t[1] || "" : t[2] || "" : ""
                } catch (e) {
                    return ""
                }
            },
        },
        /*        watch: {
                    // 如果 `question` 发生改变，这个函数就会运行
                    matchWordArray: {
                        handler(val, oldVal) {
                            this.matchWord = val.join(' ');
                        },
                        deep: true,
                        immediate: true
                    }
                },*/
        mounted() {
            this.matchWord = this.checkBoxList[4].label;
        }
    };
    new Vue({
        el: "#crackDbd",
        render: h => h(comMain)
    });
    // Your code here...
})();