import { Observer } from "./Observer";

export class EventCenter {

    /**
     * 监听数组
     */
    private listeners = {};


    /**
     * 注册事件
     * @param name 
     * @param callback 
     * @param context 
     */
    public register(name: string, callback: Function, context: any) {
        let obs: Observer[] = this.listeners[name];
        if (!obs) {
            this.listeners[name] = [];
        }
        this.listeners[name].push(new Observer(callback, context));
    }


    /**
     * 移除事件
     * @param name 
     * @param context 
     */
    public remove(name: string, context: any) {
        let obs: Observer[] = this.listeners[name];
        if (!obs) {
            return ;
        }
        let length: number = obs.length;
        for (let i: number = 0; i < length; i++) {
            let ob: Observer = obs[i];
            if (ob.compare(context)) {
                obs.splice(i, 1);
                break;
            }
        }

        if (obs.length == 0) {
            delete this.listeners[name];
        }
    }


    /**
     * 发送事件
     * @param name 
     * @param args 
     */
    public fire(name: string, ...args: any[]) {
        let obs: Observer[] = this.listeners[name];
        if (!obs) {
            return ;
        }
        let length: number = obs.length;
        for (let i: number = 0; i < length; i++) {
            let ob: Observer = obs[i];
            ob.notify(name, ...args);
        }
    }
}