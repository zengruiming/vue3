import {taskHandler} from "./controller";

self.onmessage = function ({data}) {
    taskHandler.dispatch(data.type, data.args)
        .then((res:any) => {
            self.postMessage({
                msg: 'success',
                data: res
            });
        })
        .catch((err:any) => {
            self.postMessage({
                msg: 'fail',
                data: err.message,
            });
        });
};

self.postMessage('ready');
