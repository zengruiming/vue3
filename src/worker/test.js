$httpClient.post({
    url: 'https://abtest-tx-beijing-01.saas.sensorsdata.cn/api/v2/abtest/online/results?project-key=CF31DD4420E7752714E1D81E26BDA1EAA590B7C1',
    crossDomain: true,
    method: 'post',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0',
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
        'Accept-Encoding': 'gzip, deflate, br',
        'Origin': 'https://modao.cc',
        'Connection': 'keep-alive',
        'Referer': 'https://modao.cc/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'TE': 'trailers'
    },
    contentType: 'application/json; charset=UTF-8',
    data: JSON.stringify({
        'anonymous_id': '2_230915001856789_2936',
        'platform': 'Web',
        'abtest_lib_version': '1.24.13',
        'properties': {
            '$is_first_day': true
        }
    })
}, (error, response, data) => {
    $notification.post($script.name,time("HH:mm:ss"),data)
    $done();
});

function time(fmt, ts = null) {
    const date = ts ? new Date(ts) : new Date();
    let o = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "H+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
        "q+": Math.floor((date.getMonth() + 3) / 3),
        S: date.getMilliseconds(),
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(
            RegExp.$1,
            (date.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length == 1
                    ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length)
            );
    return fmt;
}