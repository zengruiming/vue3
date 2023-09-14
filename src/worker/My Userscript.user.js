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

          <div style="position: fixed;z-index: 999;top: 0;right: 0;">
          <div style="float: right;">
          <div @click="hide = !hide"
               style="width: 46px;height: 46px;color: rgba(0,0,0,0.3);line-height: 46px;text-align: center;background-color: rgba(255, 255, 255, 0.8);margin-bottom: 6px;border-radius: 50%;font-size: 2vh;">
            x
          </div>
          </div>
          <div style="background-color: white;float: right;" v-show="hide">
            <div
                style="display: flex;align-items: center;justify-content: space-around;flex-direction: column;height: 310px;">
              <div style="width: 100%;display: flex;align-items: center;justify-content: center;">
                <span style="width: 10%;display: inline-block;font-size: .69733rem;">固定出价</span>
                <input type='number'
                       style="width: 20%;height: 36px;display: inline-block;text-align: center;line-height: .69733rem;font-size: .69733rem;"
                       v-model.number="stableOfferPrice"
                       placeholder="若填写，则固定金额出价"/>
                <span style="width: 10%;display: inline-block;font-size: .69733rem;margin-left: .6rem;">限制上限</span>
                <input type='number'
                       style="width: 20%;height: 36px;display: inline-block;text-align: center;line-height: .69733rem;font-size: .69733rem;"
                       v-model.number="maxOfferPrice"
                       placeholder="限制出价上限，仅在输入了“匹配出价”时生效"/>
                <span style="width: 10%;display: inline-block;font-size: .69733rem;margin-left: .6rem;">限制下限</span>
                <input type='number'
                       style="width: 20%;height: 36px;display: inline-block;text-align: center;line-height: .69733rem;font-size: .69733rem;"
                       v-model.number="minOfferPrice"
                       placeholder="限制出价下限，全局生效"/>
              </div>
              <div style="width: 100%;display: flex;align-items: center;justify-content: center;">
                <span style="width: 10%;display: inline-block;font-size: .69733rem;">出价延时</span>
                <input type='number'
                       style="width: 20%;height: 36px;display: inline-block;text-align: center;line-height: .69733rem;font-size: .69733rem;"
                       v-model.number="delay"
                       placeholder="请输入出价延时"/>
                <span style="width: 10%;display: inline-block;font-size: .69733rem;margin-left: .6rem;">加价金额</span>
                <input type='number'
                       style="width: 20%;height: 36px;display: inline-block;text-align: center;line-height: .69733rem;font-size: .69733rem;"
                       v-model.number="priceIncrease"
                       placeholder="请输入加价金额"/>
                <span style="width: 10%;display: inline-block;font-size: .69733rem;margin-left: .6rem;">底价偏移</span>
                <input type='number'
                       style="width: 20%;height: 36px;display: inline-block;text-align: center;line-height: .69733rem;font-size: .69733rem;"
                       v-model.number="offset"
                       placeholder="请输入底价偏移"/>
              </div>
              <div style="width: 100%;display: flex;align-items: center;justify-content: center;">
                <span
                    style="width: 10%;display: inline-block;font-size: .69733rem;">非关键词</span>
                <textarea
                    style="width: 90%;height: 40px;display: inline-block;line-height: .69733rem;font-size: .69733rem;"
                    v-model="unWord"
                    placeholder="匹配到非关键词则不出价(“ ”匹配或非关键词)">
                </textarea>
              </div>
              <div style="width: 100%;display: flex;align-items: center;justify-content: center;">
                <span
                    style="width: 10%;display: inline-block;font-size: .69733rem;">匹配出价</span>
                <textarea
                    style="width: 90%;height: 40px;display: inline-block;line-height: .69733rem;font-size: .69733rem;"
                    v-model="matchWord"
                    placeholder="匹配到非关键词则出价(“ ”匹配或关键词，“&”匹配与关键词)">
                </textarea>
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
                minOfferPrice: 150,
                priceIncrease: 3,
                offset: -0.2,
                stableOfferPrice: 0,
                delay: 800,
                unWord: "",
                matchWord: "",
                message: "",
                go: 0,
                hide: false,
            }
        },
        methods: {
            onSave() {
                axios.defaults.timeout = 1000;
                axios.defaults.withCredentials = true; //配置为true
                let pool = new ThreadPool();
                const m = new Map();
                this.go = setInterval(async () => {
                    // 列表查询
                    let listRsp = await axios.get('https://api.m.jd.com/api', {
                        params: {
                            'functionId': 'dbd.auction.list.v2',
                            'body': '{"pageNo":1,"pageSize":20,"brandList":"","qualityList":"","status":"","auctionFilterTime":0,"groupId":"","topAuctionId":null,"isPersonalRecommend":0,"p":2,"skuGroup":1,"productTypes":1,"mpSource":1,"sourceTag":2}',
                            'appid': 'paipai_h5'
                        }
                    });
                    let auctionInfos = listRsp.data.result.data.auctionInfos;
                    for (let i = 0; i < auctionInfos.length; i++) {
                        // 限制出价下限，原价小于指定下限则不参与竞拍
                        if(auctionInfos[i].cappedPrice < this.minOfferPrice) continue;
                        let auctionId = auctionInfos[i].id;
                        // 有值则返回
                        if (m.has(auctionId)) continue;
                        // 若未配置关键词，则监控所有商品；若匹配到关键词则设置为用户配置的最大出价金额,且仅监控带关键词的商品。
                        let productName = auctionInfos[i].productName;
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
                        m.set(auctionId, parseInt(this.offset) === parseFloat(this.offset) ? min + this.offset : min + min * this.offset);
                        //开始任务
                        pool
                            .run((param, done) => {
                                (async () => {
                                    let offerTime;
                                    do {
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
                                        offerTime = jsonData.result.data.actualEndTime - Date.now() - param[3];
                                        if (offerTime < 56000) break;
                                        await new Promise((resolve, reject) => setTimeout(resolve, 50000));
                                    } while (true);
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
                                        if (currentPrice === null) offerPrice = parseInt(param[0]);
                                        if (currentPrice > param[0]) offerPrice = 0;
                                        let priceBody = 'address=19-1607-4773-62122&auctionId=' + param[4] + '&entryid=&price=' + offerPrice + '&trackId=&eid=ZH62NVZXFHVBIMN5EUDTDWDBDGWE7FE6MMX2RXO65RUWXACGTJIZ5BS5FCU42MCYCGACXEBSPKCXDRIETUNG4DVMPM&fp=62888e893a17d91eaa7ad146eab9aaa3&p=2&token=phzn1gvh8g5ebct6hwu1608302936875uky5~NmZeSyVEbFNSd3d1d1FZA3p8AQ5nRHpTBiUjb35DFm5vLUROOBEzLUF7G28iAAFBKBgVFA1EPwIVKDclGENXbm8iVlQiAwpTTx1lKSsTCG5vfmsaDUR6LUEnG29%2BPU8KLHMHDGUCYERaeX4vcwQPA3V0Ago1BGFBWnkhfiJUVV97JgNkc0oKUwoyKhFmWzEQOTZCXQ1Eei1BKTQ5GENXbm80VlEhBz9fDm8tKWoCAl8RZhtkcxY4LUF7G29rDEJALC1EXQ4HIxIXKCgjagkZXyEYFRQNRCYFP2N9EWYJGUY9Nw1kc0oKUxMoG29%2BPU8Hf2gGDn1eekVPcWt8c1QxEDBmGxo0AjICBGN9bzBXCFxvaBVbIkRsUw80dXpzDV5KNC5UTiADOR0ZJC01N1RfBX4iXQg5AyYXEHk2emZNT1FvfhVIZ18mHRl5PXQ2BwcCfXRFVCkfZ0dTdHd8cFlfAXpxBUw7DG9TT2MjPipDVxA0JQUNNV81C0FtZSQ3Q1cQfGYbGjsPNVNZY350fVlPTw%3D%3D%7C~1608304185632~1~20201218~eyJ2aXdlIjoiMCIsImJhaW4iOnt9fQ%3D%3D~2~515~1pl4%7Cgw4w%3B5d4ae-qz%2C1j3%2C%2C%3B5dmu-me%2C1ii%2C%2C%3Bdoei%3A%2C1%2C413%2C413%2C0%2C0%2C1%2C1%2C0%2C0%3Bdmei%3A%2C1%2C413%2C0%2C0%2C0%2C0%2C0%2C0%2C0%3Bemc%3A%2Cd%3A1%3Bemmm%3A%3Bemcf%3A%2Cd%3A1%3Bivli%3A%3Biivl%3A%3Bivcvj%3A%3Bscvje%3A%3Bewhi%3A%3B1608304178659%2C1608304185628%2C0%2C0%2C3%2C3%2C0%2C1%2C0%2C0%2C0%3Btt4b&initFailed=false';//提交价格请求体
                                        done([priceBody, offerPrice]);
                                    }, offerTime)
                                })();
                            }, [m.get(auctionId), this.randomPrice(1,this.priceIncrease), this.stableOfferPrice, this.delay, auctionId])
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
                                m.delete(auctionId)
                            });
                    }
                }, 60000);
                this.message = "启动"
            },
            onDelete() {
                clearInterval(this.go);
                this.message = "取消"
            },
            async getMinPrice(auctionId) {
                // 商品详情查询
                const detailRsp = await axios.post(
                    'https://api.m.jd.com/api',
                    `body={"auctionId":"${auctionId}","auctionProductType":1,"p":2,"ts":${Date.now()},"dbdApiVersion":"20200623","area":"1-2810-51081-0","mpSource":1,"sourceTag":2}`,
                    {
                        params: {
                            'functionId': 'dbd.auction.detail.v2',
                            'x-api-eid-token': jdtRiskContext.deviceInfo.jsToken,
                            'appid': 'paipai_h5'
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
                            'appid': 'paipai_h5'
                        },
                    }
                );
                let offerPriceHistory = historyRsp.data.result.data
                // 计算最小出价金额，没记录取原价的百分之十、有记录取最小记录
                let min;
                if (offerPriceHistory.length === 0) {
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
            randomPrice(minimum,maximum) {
                // 校验是否包含关键词
                return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
            },
        },
    };
    new Vue({
        el: "#crackDbd",
        render: h => h(comMain)
    });
    // Your code here...
})();