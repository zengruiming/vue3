import Worker from "./worker?worker";

class Task {
    type:any = null;
    args:any = null;
    constructor(type:any, args:any) {
        this.type = type;
        this.args = args;
    }
}

class TaskWorker {
    available:any = false;
    resolve:any = null;
    reject:any = null;
    worker:any = null;
    notifyAvailable:any = null;

    constructor(notifyAvailable:any) {
        this.notifyAvailable = notifyAvailable;
        this.worker = new Worker();
        //在线程初始化完成后需要去领取已经存在的任务
        this.worker.onmessage = () => this.setAvailable();
    }

    dispatch({resolve, reject, task}: {resolve:any, reject:any, task:any}) {
        this.available = false;
        this.worker.onmessage = ({data}:{data:any}) => {
            resolve(data);
            this.setAvailable();
        };
        this.worker.onerror = (e:any) => {
            reject(e);
            this.setAvailable();
        };
        this.worker.postMessage(task);
    }

    setAvailable() {
        this.available = true;
        this.resolve = null;
        this.reject = null;
        this.notifyAvailable();
    }
}

class WorkerPool {
    #taskQueue:{
        resolve:any,
        reject:any,
        task:Task
    }[] = [];
    #workers:TaskWorker[] = [];
    poolSize:number = 0;

    constructor(poolSize:number) {
        for (let i = 0; i < poolSize; i++) {
            this.#workers.push(
                new TaskWorker(() => this.#dispatchIfAvailable())
            );
        }
    }

    start(type:any, postMessageArgs:any) {
        return new Promise((resolve, reject) => {
            this.#taskQueue.push({
                resolve,
                reject,
                task: new Task(type, postMessageArgs)
            });
            this.#dispatchIfAvailable();
        });
    }

    #dispatchIfAvailable() {
        if (!this.#taskQueue.length) {
            return;
        }
        for (let worker of this.#workers) {
            if (worker.available) {
                let a:any = this.#taskQueue.shift();
                worker.dispatch(a);
                break;
            }
        }
    }

    close() {
        for (let worker of this.#workers) {
            worker.worker.terminate();
        }
    }
}

const poll = new WorkerPool(navigator.hardwareConcurrency - 1);

export {poll};
