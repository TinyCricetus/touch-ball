import { EventCenter } from "./Event/EventCenter";

/**
 * 用于各类之间的数据交互
 */
export class GameBasic {

    private static gameBasic: GameBasic = null;
    private eventCenter: EventCenter = null;

    public static getInstance(): GameBasic {
        if (this.gameBasic == null) {
            this.gameBasic = new GameBasic();
            return this.gameBasic;
        } else {
            return this.gameBasic;
        }
    }

    private constructor() {
        this.eventCenter = new EventCenter();
    }

    /**
     * 事件注册
     * @param name 事件名
     * @param callback 回调函数
     * @param context 回调函数使用的上下文
     */
    public registerEvent(name: string, callback: Function, context: any) {
        this.eventCenter.register(name, callback, context);
    }


    public removeEvent(name: string, context: any) {
        this.eventCenter.remove(name, context);
    }


    public notifyEvent(name: string, ...args: any[]) {
        this.eventCenter.fire(name, ...args);
    }

}
