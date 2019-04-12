

export class Observer {
    /**
     * 回调函数
     */
    private callback: Function = null;
    /**
     * 上下文
     */
    private context: any = null;

    public constructor(callback: Function, context: any) {
        let self: Observer = this;
        self.callback = callback;
        self.context = context;
    }

    /**
     * 发送通知
     * @param args 
     */
    public notify(...args: any[]) {
        let self: Observer = this;
        self.callback.call(self.context, ...args);
    }

    /**
     * 上下文比较
     * @param context 
     */
    public compare(context: any): boolean {
        return context == this.context;
    }
}