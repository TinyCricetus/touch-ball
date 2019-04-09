import { BRICK_TYPE } from "./BrickData";

/**
 * 定义三个结点池，
 * BrickNodePool-砖块结点池
 * LineBallNodePool-轨迹球结点池
 * BallNodePool-冲击球结点池
 */

const MAXN: number = 60;//结点池统一初始化的数量

/**
 * 砖块结点池应该分类，因为目前有五种砖块，其中一种正方形(1型)，四种三角形方块(3,4,5,6型)
 */
export class BrickNodePool {
    private brickNodePool: cc.NodePool[] = null;
    private prefabs: cc.Prefab[] = null;

    public constructor(prefabs: cc.Prefab[]) {
        this.prefabs = prefabs;
        this.init();
    }

    /**
     * 
     * @param brickType 方块预制体的序号，注意转换
     */
    public getBrickNode(kind: number): cc.Node {
        let serial: number = this.brickTypeToPrefabSerial(kind);
        if (this.brickNodePool[serial].size() > 0) {
            let temp: cc.Node = this.brickNodePool[serial].get();
            return temp;
        } else {
            let temp: cc.Node = cc.instantiate(this.prefabs[serial]);
            return temp;
        }
    }

    public putBrickNode(node: cc.Node, brickType: number) {
        let serial: number = this.brickTypeToPrefabSerial(brickType);
        let parentNode: cc.Node = node.parent;
        parentNode.removeChild(node);
        this.brickNodePool[serial].put(node);
    }

    /**
     * 将方块的种类转化为预制体列表中的预制体序号
     * @param brickType 
     */
    public brickTypeToPrefabSerial(brickType: number): number {
        switch(brickType) {
            case BRICK_TYPE.SQUARE:
            return 0;

            case BRICK_TYPE.TRIANGLE_LEFT_BOTTOM:
            return 1;

            case BRICK_TYPE.TRIANGLE_LEFT_TOP:
            return 4;

            case BRICK_TYPE.TRIANGLE_RIGHT_BOTTOM:
            return 2;

            case BRICK_TYPE.TRIANGLE_RIGHT_TOP:
            return 3;
            
            case BRICK_TYPE.SQUARE_DISMISS_ROW:
            return 5;

            default:
            cc.log("砖块种类匹配出错!");
            return 0;//出错时默认返回0
        }
    }

    private init() {
        this.brickNodePool = [];
        for (let i: number = 0; i < this.prefabs.length; i++) {
            this.brickNodePool[i] = new cc.NodePool();
        }
        for (let i: number = 0; i < this.prefabs.length; i++) {
            for (let j: number = 0; j < MAXN; j++) {
                let temp: cc.Node = cc.instantiate(this.prefabs[i]);
                this.brickNodePool[i].put(temp);
            }
        }
    }
}


export class LineBallNodePool {
    private lineBallNodePool: cc.NodePool = null;
    private prefab: cc.Prefab = null;

    public constructor(prefab: cc.Prefab) {
        this.prefab = prefab;
        this.init();
    }

    public getLineBallNode(): cc.Node {
        if (this.lineBallNodePool.size() > 0) {
            let temp: cc.Node = this.lineBallNodePool.get();
            return temp;
        } else {
            let temp: cc.Node = cc.instantiate(this.prefab);
            return temp;
        }
    }

    public putLineBallNode(node: cc.Node) {
        let parentNode: cc.Node = node.parent;
        parentNode.removeChild(node);
        this.lineBallNodePool.put(node);
    }

    private init() {
        this.lineBallNodePool = new cc.NodePool();
        for (let i = 0; i < MAXN; i++) {
            let temp: cc.Node = cc.instantiate(this.prefab);
            this.lineBallNodePool.put(temp);
        }
    }
}



export class BallNodePool {
    private ballNodePool: cc.NodePool = null;
    private prefab: cc.Prefab = null;

    public constructor(prefab: cc.Prefab) {
        this.prefab = prefab;
        this.init();
    }

    public getBallNode(): cc.Node {
        if (this.ballNodePool.size() > 0) {
            let temp: cc.Node = this.ballNodePool.get();
            return temp;
        } else {
            let temp: cc.Node = cc.instantiate(this.prefab);
            return temp;
        }
    }

    public putBallNode(node: cc.Node) {
        let parentNode: cc.Node = node.parent;
        parentNode.removeChild(node);
        this.ballNodePool.put(node);
    }

    private init() {
        this.ballNodePool = new cc.NodePool();
        for (let i = 0; i < MAXN; i++) {
            let temp: cc.Node = cc.instantiate(this.prefab);
            this.ballNodePool.put(temp);
        }
    }
}
