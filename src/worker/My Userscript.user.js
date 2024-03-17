// ==UserScript==
// @name         My Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
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

          <div :style="{ width: divWidth,position: 'fixed',zIndex: 999,top: 0,right: 0,height: '510px'}">
            <div style="float: right;">
              <div @click="toMini"
                   style="width: 46px;height: 46px;color: rgba(0,0,0,0.3);line-height: 46px;text-align: center;background-color: rgba(255, 255, 255, 0.8);margin-bottom: 6px;border-radius: 50%;font-size: 2vh;">
                x
              </div>
            </div>
            <div style="background-color: white;float: right;width: 100%;height: 100%;" v-show="hide">
              <div
                  style="display: flex;align-items: center;justify-content: space-around;flex-direction: column;height: 100%;" v-show="!switchLog">
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
                  <span style="width: 10%;display: inline-block;font-size: .39rem;">底价出价</span>
                  <input type='number'
                         style="width: 20%;height: 18px;display: inline-block;text-align: center;line-height: .6rem;font-size: .6rem;"
                         v-model.number="bottomOfferPrice"
                         placeholder="若填写，则固定底价金额出价"/>
                  <span
                      style="width: 10%;display: inline-block;font-size: .39rem;margin-left: .6rem;">加价金额</span>
                  <input
                      style="width: 20%;height: 18px;display: inline-block;text-align: center;line-height: .6rem;font-size: .6rem;"
                      v-model="priceIncrease"
                      placeholder="0-*、*-0则当前价到底价随机，否则当前价+随机金额"/>
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
                    <input style="display: inline;height: auto;" type="checkbox" name="gender" :value="item.value" :id="item.value"
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
              </div>
              <div
                  style="display: flex;align-items: center;justify-content: space-around;flex-direction: column;height: 100%;" v-show="switchLog">
              <textarea
                  style="width: 100%;height: 100%;display: inline-block;line-height: .5rem;font-size: .5rem;border: none;" readonly="readonly">{{offerLog}}</textarea>
              </div>
              <div style="color: red;text-align: center;display: flex;justify-content: space-evenly;">
                <div>
                  <input style="display: inline;height: auto;" type="checkbox" id = "openLog"
                                       :checked="openLog" @click.stop="openLogFn"/>
                  <label for="openLog">
                    开关日志
                  </label>
                </div>
                <label @click.stop="switchLogFn" >
                  {{ message }}
                </label>
              </div>
            </div>
          </div>

        `,
        data() {
            return {
                maxOfferPrice: 0,
                minOfferPrice: 299,
                priceIncrease: "1-10",
                offset: -0.2,
                stableOfferPrice: 0,
                bottomOfferPrice: 0,
                unWord: "赠品 非卖 保护套 手机壳 保护壳 霜 露 液 沫 颜 膜 膏 妆 肤",
                matchWord: "",
                message: "欢迎使用",
                offerLog: "",
                switchLog: false,
                openLog: false,
                go: 0,
                hide: false,
                divWidth: 'auto',
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
                offerModel: [0, 1, 2],
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
                v: new Map(),
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
                            // 已过竞拍时间，则清除
                            if (end < 0) {
                                this.m.delete(auctionId)
                                this.auctionInfos.splice(i, 1)
                                i--
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
                            //偏移价格(若为整数，则直接偏移整数价格；若为小数，则偏移小数乘以最小出价金额的价格)
                            let offsetPrice = parseInt(this.offset) === parseFloat(this.offset) ? Math.floor(min + this.offset) : Math.floor(min + min * this.offset)
                            //抬价金额
                            let increaseOfferPrice = this.randomPrice(parseInt(this.priceIncrease.split('-')[0]), parseInt(this.priceIncrease.split('-')[1]));
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
                                        let offerTime = jsonData.result.data.actualEndTime - Date.now() - 800;
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
                                            let currentPrice = jsonData.result.data.currentPrice + 1;

                                            let offerPrice
                                            if (param[2]) {
                                                // 固定价格出价
                                                offerPrice = param[2]
                                            } else if (param[3]) {
                                                // 固定底价出价
                                                offerPrice = param[0]
                                            } else {
                                                // 随机抬价金额出价
                                                let randomPrice = param[1];
                                                if(randomPrice){
                                                    offerPrice = currentPrice + randomPrice - 1
                                                }else {
                                                    offerPrice = Math.floor(Math.random() * (currentPrice - param[0] + 1)) + param[0]
                                                }
                                            }
                                            if (currentPrice >= param[0]) offerPrice = 0;
                                            //auctionId、offerPrice
                                            done([param[4], Math.ceil(offerPrice)]);
                                        }, offerTime)
                                    })();
                                }, [offsetPrice, increaseOfferPrice, this.stableOfferPrice, this.bottomOfferPrice, auctionId])
                                .done(result => {
                                    if (result[1] === 0) {
                                        this.message = "并未出价：超过了近期最低价！";
                                    } else {
                                        let t = (new Date).getTime()
                                        let uuid = this.getCookieUUID("__jda");
                                        let jsToken = jdtRiskContext.deviceInfo.jsToken;
                                        axios.post(
                                            'https://api.m.jd.com/api',
                                            `body={"auctionId":"${result[0]}","price":${result[1]},"ts":${t},"entryid":"p0020003youb3","address":"19-1607-4773-62122","mpSource":1,"sourceTag":2}`,
                                            {
                                                params: {
                                                    'functionId': 'paipai.auction.offerPrice',
                                                    't': t,
                                                    'appid': 'paipai_h5',
                                                    'x-api-eid-token': jsToken,
                                                    'uuid': uuid
                                                }
                                            }
                                        ).then(async res => {
                                            await this.wxPusher()
                                            //若开启了日志功能，则显示在大面板
                                            if (this.openLog) {
                                                const now = new Date();
                                                const formattedDate = this.formatDate(now);
                                                this.offerLog = this.offerLog + (this.offerLog && "\r\n") + `${formattedDate}=> ` + `Id:${result[0]} ` + `Price:${result[1]} ` + JSON.stringify(res.data)
                                            }else {
                                                //默认是显示在状态栏
                                                this.message = res.data.result.message
                                            }
                                        })
                                    }
                                });
                        } catch (error) {
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
                // 未找到历史出价时，最小出价金额默认值为原价的1折
                let cappedPriceMin = detailRsp.data.result.data.auctionInfo.cappedPrice * 0.1;
                let length = offerPriceHistory.length;
                if (length === 0) {
                    min = cappedPriceMin;
                } else {
                    const arr = offerPriceHistory.map(({offerPrice}) => offerPrice);
                    let historyMin = Math.min.apply(null, arr);
                    if (length < 5) {
                        min = cappedPriceMin < historyMin ? cappedPriceMin : historyMin
                    } else {
                        min = historyMin
                    }
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
            randomPrice(min, max) {
                // 最小、大值为0时，返回0；用于当前价格最小金额随机出价方式
                return min && max ? Math.floor(Math.random() * (max - min + 1)) + min : 0
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
                    var e = this.getCookie(val)
                        , t = e && e.split(".");
                    return Array.isArray(t) && t.length > 1 ? t[0] ? t[1] || "" : t[2] || "" : ""
                } catch (e) {
                    return ""
                }
            },
            getCookie(name) {
                var cookies = document.cookie.split(";"); // 将cookie字符串分割成数组
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = cookies[i].trim(); // 使用trim()方法去除前后空格
                    if (cookie.indexOf(name + "=") === 0) {
                        return cookie.substring(name.length + 1, cookie.length); // 获取cookie的值
                    }
                }
                return ""; // 当未找到指定cookie时返回空字符串
            },
            formatDate(date) {
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份是从0开始的
                const year = date.getFullYear();
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const seconds = date.getSeconds().toString().padStart(2, '0');

                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            },
            toMini() {
                this.hide = !this.hide
                this.divWidth = this.hide?'100%':'auto'
            },
            switchLogFn() {
                this.switchLog = !this.switchLog
            },
            openLogFn() {
                this.openLog = !this.openLog
            },
            async wxPusher() {
                const listRsp = await axios.get('https://api.m.jd.com/api', {
                    params: {
                        'functionId': 'dbd.record.myRecords',
                        'body': '{"showStatus":-1,"pageSize":20,"pageNum":1,"p":2,"even":true,"mpSource":1,"sourceTag":2}',
                        'appid': 'paipai_h5'
                    }
                });
                let arr = listRsp.data.result.data.bidRecordList;
                for (let i in arr) {
                    if (arr[i].status === 2 || arr[i].status === 3) {
                        //判断是否存在该值，不存在则发送通知
                        let hasVar = this.v.has(arr[i].auctionId);
                        if (!hasVar) {
                            let res = await fetch("https://wxpusher.zjiecode.com/api/send/message", {
                                "headers": {
                                    "content-type": "application/json",
                                },
                                "body": JSON.stringify({
                                    "appToken": "AT_gPhWPvPdl0TL3Ls1Q2DZ8tXe5vNUwf0u",
                                    "content": arr[i].productName,
                                    "summary": "夺宝岛",//消息摘要，显示在微信聊天页面或者模版消息卡片上，限制长度100，可以不传，不传默认截取content前面的内容。
                                    "contentType": 1,//内容类型 1表示文字  2表示html(只发送body标签内部的数据即可，不包括body标签) 3表示markdown
                                    "uids": [//发送目标的UID，是一个数组。注意uids和topicIds可以同时填写，也可以只填写一个。
                                        "UID_zGDvPRKAabyj8vIVJgNaoeUMwumV"
                                    ],
                                    "url": "https://paipai.m.jd.com/ppdbd/pages/detail/index?id=" + arr[i].auctionId, //原文链接，可选参数
                                    "verifyPay": false //是否验证订阅时间，true表示只推送给付费订阅用户，false表示推送的时候，不验证付费，不验证用户订阅到期时间，用户订阅过期了，也能收到。
                                }),
                                "method": "POST",
                            });
                            let jsonData = await res.json()
                            let code = jsonData.code;
                            if (code === 1000) {
                                this.v.set(arr[i].auctionId, 0)
                            }
                        }
                    } else {
                        this.v.delete(arr[i].auctionId)
                    }
                }
            }
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
/*        mounted() {
            this.matchWord = this.checkBoxList[4].label;
        }*/
    };
    new Vue({
        el: "#crackDbd",
        render: h => h(comMain)
    });
    // Your code here...
})();