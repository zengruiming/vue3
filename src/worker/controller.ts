interface MyTask {
    list: any
    register: any
    dispatch: any
}

const taskHandler: MyTask = {
    list: {},
    register(type: any, handler: any) {
        this.list[type] = handler;
        return this;
    },
    dispatch(type: any, args: any) {
        return new Promise((resolve, reject) => {
            return this.list[type](resolve, reject, args);
        });
    }
};

taskHandler
    .register('task1', async function (resolve: any, reject: any, args: any) {
        let res = await fetch('https://used-api.jd.com/auctionRecord/getCurrentAndOfferNum?auctionId=' + args.x1)
        let jsonData = await res.json()
        let offerTime = jsonData.data.actualEndTime - Date.now() - args.delay
        setTimeout(async () => {
            let res = await fetch('https://used-api.jd.com/auctionRecord/getCurrentAndOfferNum?auctionId=' + args.x1)
            let jsonData = await res.json()
            let currentPrice = jsonData.data.currentPrice
            if (currentPrice > args.maxOfferPrice) return
            // 判断是否固定价格出价
            let offerPrice
            if (args.stableOfferPrice === 0) {
                offerPrice = currentPrice + args.priceIncrease
            } else {
                offerPrice = args.stableOfferPrice
            }
            let priceBody = 'address=19-1607-4773-62122&auctionId=' + args.x1 + '&entryid=&price=' + offerPrice + '&trackId=&eid=ZH62NVZXFHVBIMN5EUDTDWDBDGWE7FE6MMX2RXO65RUWXACGTJIZ5BS5FCU42MCYCGACXEBSPKCXDRIETUNG4DVMPM&fp=62888e893a17d91eaa7ad146eab9aaa3&p=2&token=phzn1gvh8g5ebct6hwu1608302936875uky5~NmZeSyVEbFNSd3d1d1FZA3p8AQ5nRHpTBiUjb35DFm5vLUROOBEzLUF7G28iAAFBKBgVFA1EPwIVKDclGENXbm8iVlQiAwpTTx1lKSsTCG5vfmsaDUR6LUEnG29%2BPU8KLHMHDGUCYERaeX4vcwQPA3V0Ago1BGFBWnkhfiJUVV97JgNkc0oKUwoyKhFmWzEQOTZCXQ1Eei1BKTQ5GENXbm80VlEhBz9fDm8tKWoCAl8RZhtkcxY4LUF7G29rDEJALC1EXQ4HIxIXKCgjagkZXyEYFRQNRCYFP2N9EWYJGUY9Nw1kc0oKUxMoG29%2BPU8Hf2gGDn1eekVPcWt8c1QxEDBmGxo0AjICBGN9bzBXCFxvaBVbIkRsUw80dXpzDV5KNC5UTiADOR0ZJC01N1RfBX4iXQg5AyYXEHk2emZNT1FvfhVIZ18mHRl5PXQ2BwcCfXRFVCkfZ0dTdHd8cFlfAXpxBUw7DG9TT2MjPipDVxA0JQUNNV81C0FtZSQ3Q1cQfGYbGjsPNVNZY350fVlPTw%3D%3D%7C~1608304185632~1~20201218~eyJ2aXdlIjoiMCIsImJhaW4iOnt9fQ%3D%3D~2~515~1pl4%7Cgw4w%3B5d4ae-qz%2C1j3%2C%2C%3B5dmu-me%2C1ii%2C%2C%3Bdoei%3A%2C1%2C413%2C413%2C0%2C0%2C1%2C1%2C0%2C0%3Bdmei%3A%2C1%2C413%2C0%2C0%2C0%2C0%2C0%2C0%2C0%3Bemc%3A%2Cd%3A1%3Bemmm%3A%3Bemcf%3A%2Cd%3A1%3Bivli%3A%3Biivl%3A%3Bivcvj%3A%3Bscvje%3A%3Bewhi%3A%3B1608304178659%2C1608304185628%2C0%2C0%2C3%2C3%2C0%2C1%2C0%2C0%2C0%3Btt4b&initFailed=false'//提交价格请求体
            resolve(priceBody);
        }, offerTime)
    });

export {taskHandler}
