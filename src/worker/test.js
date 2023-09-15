$httpClient.post({
    url: 'http://www.example.com/',
    headers: {

    },
    body: JSON.stringify({

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