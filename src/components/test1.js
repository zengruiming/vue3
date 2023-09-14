// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://paipai.m.jd.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require      https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.min.js
// @require      http://andywer.github.io/threadpool-js/dist/threadpool.min.js
// @require      https://cdn.staticfile.org/axios/0.18.0/axios.min.js
// ==/UserScript==

(function() {
    'use strict';


    let crackApp = document.createElement("div");
    crackApp.id = "crackDbd";
    document.body.appendChild(crackApp);

    const comMain = {
        template: `

          <div style="position: fixed;z-index: 999;top: 0;width: 100%;margin-top: 50px;">
          <div @click="hide = !hide"
               style="width: 36px;height: 36px;color: rgba(0,0,0,0.3);margin-left: 84%;line-height: 36px;text-align: center;background-color: rgba(255, 255, 255, 0.8);margin-bottom: 20px;border-radius: 50%;font-size: 2vh;">
            x
          </div>
          <div style="background-color: white;padding: 30px 0px;" v-show="hide">
            <div
                style="display: flex;align-items: center;justify-content: space-around;flex-direction: column;height: 380px;">
              <div style="width: 80%;"><span
                  style="width: 24%;display: inline-block;padding-left: 14px;font-size: .69733rem;">限制金额: </span>
                <input type='number' style="height: 36px;display: inline-block;text-align: center;line-height: .69733rem;width: 66%;font-size: .69733rem;"
                       v-model.number="maxOfferPrice"
                       placeholder="请输入限制金额"/></div>

              <div style="width: 80%;"><span
                  style="width: 24%;display: inline-block;padding-left: 14px;font-size: .69733rem;">加价金额: </span>
                <input type='number' style="height: 36px;display: inline-block;text-align: center;line-height: .69733rem;width: 66%;font-size: .69733rem;"
                       v-model.number="priceIncrease"
                       placeholder="请输入加价金额"/></div>

              <div style="width: 80%;"><span
                  style="width: 24%;display: inline-block;padding-left: 14px;font-size: .69733rem;">固定出价: </span>
                <input type='number' style="height: 36px;display: inline-block;text-align: center;line-height: .69733rem;width: 66%;font-size: .69733rem;"
                       v-model.number="stableOfferPrice"
                       placeholder="若不填，则为限制金额出价"/>
              </div>

              <div style="width: 80%;"><span
                  style="width: 24%;display: inline-block;padding-left: 14px;font-size: .69733rem;">出价延时: </span>
                <input type='number' style="height: 36px;display: inline-block;text-align: center;line-height: .69733rem;width: 66%;font-size: .69733rem;" v-model.number="delay"
                       placeholder="请输入出价延时"/>
              </div>

              <div style="width: 80%;"><span
                  style="width: 24%;display: inline-block;padding-left: 14px;font-size: .69733rem;">尝试底价: </span>
                <input type='number' style="height: 36px;display: inline-block;text-align: center;line-height: .69733rem;width: 66%;font-size: .69733rem;"
                       v-model.number="avgOnOrOff"
                       placeholder="请输入尝试底价"/></div>

              <div style="width: 300px;display: flex;justify-content: space-between;">
                <button @click="onSave"
                        style="width: 46%;height: 50px;border-radius: 30px;text-align: center;line-height: 38px;margin: 2%;border-width: 1px;font-size: 0.89733rem;">
                  启&nbsp;&nbsp;&nbsp;&nbsp;动
                </button>
                <button @click="onDelete"
                        style="width: 46%;height: 50px;border-radius: 30px;text-align: center;line-height: 38px;margin: 2%;border-width: 1px;font-size: 0.89733rem;">
                  取&nbsp;&nbsp;&nbsp;&nbsp;消
                </button>
              </div>
            </div>
            <div v-show="message" style="color: red;text-align: center;">{{ message }}</div>
          </div>
          </div>

        `,
        data() {
            return {
                maxOfferPrice: 99999,
                priceIncrease: 1,
                stableOfferPrice: 0,
                delay: 800,
                avgOnOrOff: false,
                message: "",
                go: 0,
                hide: false,
            }
        },
        methods: {
            onSave() {
                axios.defaults.timeout=500;
                axios.defaults.withCredentials = true; //配置为true
                let allArray = [];
                let pool = new ThreadPool();
                this.go = setInterval(async () => {
                    let res = await axios({
                        url: 'https://used-api.jd.com/auctionRecord/myRecords?showStatus=-1&pageSize=20&pageNum=1&p=2&even=true&callback=jsonp_1624631828931_78810',
                    })
                    let dataString = res.data
                    let matchReg = /\{.+\}/g
                    let match = dataString.match(matchReg)[0]
                    let bidRecordList = JSON.parse(match).data.bidRecordList
                    bidRecordList
                        .filter(x => x['endTime'] < ( Date.now() + 60 * 1000 ) && x['endTime'] > Date.now() && !allArray.includes(x["auctionId"]))
                        .map(x => {
                            let x1 = x["auctionId"];
                            allArray.push(x1)
                            //开始任务
                            pool
                                .run((param, done) => {
                                    (async () => {
                                        let res = await fetch('https://used-api.jd.com/auctionRecord/getCurrentAndOfferNum?auctionId='+ param[5])
                                        let jsonData = await res.json();
                                        let offerTime = jsonData.data.actualEndTime - Date.now() - param[3]
                                        setTimeout(async () => {
                                            let res = await fetch('https://used-api.jd.com/auctionRecord/getCurrentAndOfferNum?auctionId='+ param[5])
                                            let jsonData = await res.json();
                                            let currentPrice = jsonData.data.currentPrice;
                                            if (currentPrice > param[0]) return;
                                            // 判断是否固定价格出价
                                            let offerPrice
                                            if (param[2] === 0) {
                                                offerPrice = currentPrice + param[1]
                                            } else {
                                                offerPrice = param[2]
                                            }
                                            let priceBody = 'address=19-1607-4773-62122&auctionId=' + param[5] + '&entryid=&price=' + offerPrice + '&trackId=&eid=ZH62NVZXFHVBIMN5EUDTDWDBDGWE7FE6MMX2RXO65RUWXACGTJIZ5BS5FCU42MCYCGACXEBSPKCXDRIETUNG4DVMPM&fp=62888e893a17d91eaa7ad146eab9aaa3&p=2&token=phzn1gvh8g5ebct6hwu1608302936875uky5~NmZeSyVEbFNSd3d1d1FZA3p8AQ5nRHpTBiUjb35DFm5vLUROOBEzLUF7G28iAAFBKBgVFA1EPwIVKDclGENXbm8iVlQiAwpTTx1lKSsTCG5vfmsaDUR6LUEnG29%2BPU8KLHMHDGUCYERaeX4vcwQPA3V0Ago1BGFBWnkhfiJUVV97JgNkc0oKUwoyKhFmWzEQOTZCXQ1Eei1BKTQ5GENXbm80VlEhBz9fDm8tKWoCAl8RZhtkcxY4LUF7G29rDEJALC1EXQ4HIxIXKCgjagkZXyEYFRQNRCYFP2N9EWYJGUY9Nw1kc0oKUxMoG29%2BPU8Hf2gGDn1eekVPcWt8c1QxEDBmGxo0AjICBGN9bzBXCFxvaBVbIkRsUw80dXpzDV5KNC5UTiADOR0ZJC01N1RfBX4iXQg5AyYXEHk2emZNT1FvfhVIZ18mHRl5PXQ2BwcCfXRFVCkfZ0dTdHd8cFlfAXpxBUw7DG9TT2MjPipDVxA0JQUNNV81C0FtZSQ3Q1cQfGYbGjsPNVNZY350fVlPTw%3D%3D%7C~1608304185632~1~20201218~eyJ2aXdlIjoiMCIsImJhaW4iOnt9fQ%3D%3D~2~515~1pl4%7Cgw4w%3B5d4ae-qz%2C1j3%2C%2C%3B5dmu-me%2C1ii%2C%2C%3Bdoei%3A%2C1%2C413%2C413%2C0%2C0%2C1%2C1%2C0%2C0%3Bdmei%3A%2C1%2C413%2C0%2C0%2C0%2C0%2C0%2C0%2C0%3Bemc%3A%2Cd%3A1%3Bemmm%3A%3Bemcf%3A%2Cd%3A1%3Bivli%3A%3Biivl%3A%3Bivcvj%3A%3Bscvje%3A%3Bewhi%3A%3B1608304178659%2C1608304185628%2C0%2C0%2C3%2C3%2C0%2C1%2C0%2C0%2C0%3Btt4b&initFailed=false';//提交价格请求体
                                            done(priceBody);
                                        }, offerTime)
                                    })();
                                }, [this.maxOfferPrice, this.priceIncrease, this.stableOfferPrice, this.delay, this.avgOnOrOff, x1])
                                .done(priceBody => {
                                    axios({
                                        url: 'https://used-api.jd.com/auctionRecord/offerPrice',
                                        method: 'post',
                                        data: priceBody,
                                    }).then(res => {
                                        this.message = "请求结果：" + res.data.message;
                                    });
                                });
                            return x;
                        });
                }, 60 * 1000);
                this.message = "启动"
            },
            onDelete() {
                clearInterval(this.go);
                this.message = "取消"
            }
        },
    };
    new Vue({
        el: "#crackDbd",
        render: h => h(comMain)
    });
    // Your code here...
})();