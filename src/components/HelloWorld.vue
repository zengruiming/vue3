<script setup lang="ts">
import {ref} from 'vue'
import axios from "axios";
import {poll} from "../worker/core";
import {showNotify} from "vant";

defineProps<{msg:String}>()

const maxOfferPrice = ref(99999)
const priceIncrease = ref(1)
const stableOfferPrice = ref(0)
const delay = ref(1200)
const avgOnOrOff = ref(false)
const show = ref(false)
let go:number=0

const onSave = function () {

    axios.defaults.withCredentials = true; //配置为true
    axios.defaults.timeout = 200;
    let allArray:string[] = [];

    go = window.setInterval(async () => {
        let res = await axios({
            url: 'https://used-api.jd.com/auctionRecord/myRecords?showStatus=-1&pageSize=20&pageNum=1&p=2&even=true&callback=jsonp_1624631828931_78810',
        })
        let dataString = res.data
        let matchReg = /\{.+\}/g
        let match = dataString.match(matchReg)[0]
        let bidRecordList = JSON.parse(match).data.bidRecordList
        bidRecordList
            .filter((x:any) => x['endTime'] > Date.now() && !allArray.includes(x["auctionId"]))
            .map((x:any) => {
                let x1 = x["auctionId"];
                allArray.push(x1)
                poll.start('task1', {
                    maxOfferPrice: maxOfferPrice.value,
                    priceIncrease: priceIncrease.value,
                    stableOfferPrice: stableOfferPrice.value,
                    delay: delay.value,
                    avgOnOrOff: avgOnOrOff.value,
                    x1: x1,
                }).then(res => {
                    //开始任务
                    axios({
                        url: 'https://used-api.jd.com/auctionRecord/offerPrice',
                        method: 'post',
                        data: res,
                    }).then(res => {
                        showNotify({ type: 'success', message: '请求结果：'+ res.data.message,duration: 0 });
                    });
                });
                return x;
            });
    }, 6 * 1000);
    showNotify({ type: 'success', message: '提交成功',duration: 0 });
    show.value=false;
}
const onDelete = function () {
    window.clearInterval(go);
    showNotify({ type: 'warning', message: '取消成功',duration : 0 });
    show.value=false;
}

</script>

<template>
    <van-notify></van-notify>
    <van-row justify="end">
        <van-col span="6">
            <van-sticky offset-top="16vw">
                <van-button plain round icon="cross" color="grey" id="showAndClose" @click="show = !show"/>
            </van-sticky>
        </van-col>
    </van-row>
    <van-dialog :show="show" @confirm="onSave" @cancel="onDelete" title="设置启动参数" show-cancel-button>
        <van-form id="formBox">
            <van-cell-group inset>
                <van-field v-model="maxOfferPrice" type="number" label="限制金额:" />
                <van-field v-model="priceIncrease" type="number" label="加价金额:" />
                <van-field v-model="stableOfferPrice" type="number" label="固定出价:" />
                <van-field v-model="delay" type="number" label="出价延时:" />
                <van-cell center title="尝试底价:">
                    <template #right-icon>
                        <van-switch v-model="avgOnOrOff" />
                    </template>
                </van-cell>
            </van-cell-group>
        </van-form>
    </van-dialog>
</template>

<style scoped>
#showAndClose {
    width: 12vw;
    height: 12vw;
}
</style>
