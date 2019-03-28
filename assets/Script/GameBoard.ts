import { GameScene } from "./GameScene";
import { BrickNodePool } from "./NodePool";
import { BRICKTYPE, BRICKSIZE } from "./BrickData";
import { GameMap } from "./GameMap";
import { BrickConfig } from "./BrickConfig";

/**
 * 砖块信息类
 */
class Brick {
    public type: number = 0;
    public position: cc.Vec2 = null;
    public constructor() {
        this.type = BRICKTYPE.EMPTY;
        this.position = cc.v2(0, 0);
    }
}

/**
 * 反射边枚举
 */
export enum SIDE {
    LEFT,
    TOP,
    RIGHT
}

/**
 * 反射点信息类
 */
export class Reflect {
    public reflectSide: SIDE = null;
    public position: cc.Vec2 = null;
    public constructor(pos: cc.Vec2, ref: SIDE) {
        this.reflectSide = ref;
        this.position = pos;
    }
}

/**
 * 游戏棋盘数据处理
 */
export class GameBoard {

    private gameWidth: number = 720;
    private gameHeight: number = 1280;

    private brickStateArray: Brick[][] = null;
    private brickPosArray: cc.Vec2[][] = null;

    private gameMap: GameMap = null;

    private boardWidth: number = 0;
    private boardHeight: number = 0;

    private correctValue: number = 10;

    public constructor() {
        this.init();
    }

    /**
     * 计算弹道的边界位置,没有结果将返回null
     * @param posA 球位置
     * @param posB 触控位置
     */
    public figureDestination(posA: cc.Vec2, posB: cc.Vec2): Reflect {
        if (Math.abs(posA.x - posB.x) < 0.05) {
            return;
        }
        let k: number = (posA.y - posB.y) / (posA.x - posB.x);
        let b: number = posA.y - k * posA.x;

        let sideA: number = -this.gameWidth / 2;
        let sideB: number = -sideA;
        let sideC: number = this.gameHeight / 2;

        let pointA: cc.Vec2 = cc.v2(sideA + this.correctValue, sideA * k + b);
        let pointB: cc.Vec2 = cc.v2(sideB - this.correctValue, sideB * k + b);
        let pointC: cc.Vec2 = cc.v2((sideC - b) / k, sideC - this.correctValue);

        let sideArray: cc.Vec2[] = [pointA, pointB, pointC];
        //修改判断顺序可以优化弹道
        // for (let i of sideArray) {
        //     if (this.isContain(i)) {
        //         return i;
        //     }
        // }
        for (let i: number = 0; i < sideArray.length; i++) {
            if (this.isContain(sideArray[i])) {
                //补充反射轨迹
                switch(i) {
                    case 0:
                    return new Reflect(cc.v2(sideArray[i]), SIDE.LEFT);
                    
                    case 1:
                    return new Reflect(cc.v2(sideArray[i]), SIDE.RIGHT);
                    
                    case 2:
                    return new Reflect(cc.v2(sideArray[i]), SIDE.TOP);

                    default:
                    break;
                }
            }
        }

        cc.log("没有焦点!");
        return null;
    }

    /**
     * 获取配置好的砖块节点
     * @param brickConfig 砖块配置器
     * @param brickNodePool 砖块结点池
     */
    public getBrickNodeArray(brickConfig: BrickConfig, brickNodePool: BrickNodePool): cc.Node[] {
        let brickNodeArray: cc.Node[] = [];
        for (let i = 0; i < this.brickStateArray.length; i++) {
            for (let j = 0; j < this.brickStateArray[i].length; j++) {
                let bsa: Brick = this.brickStateArray[i][j];
                if (bsa.type != BRICKTYPE.EMPTY) {
                    //第一次生成的节点应该采用颜色最深的纹理(0-10)
                    let temp: cc.Node = brickNodePool.getBrickNode(bsa.type);
                    temp.getComponent(cc.Sprite).spriteFrame = brickConfig.getBlockSpriteFrame(bsa.type, 5);
                    temp.position = bsa.position;
                    brickNodeArray.push(temp);
                }
            }
        }
        return brickNodeArray;
    }

    /**
     * 计算单位向量
     * @param vector 
     */
    public getUnitVec(vector: cc.Vec2): cc.Vec2 {
        let vecSize: number = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        let unitVec: cc.Vec2 = cc.v2(vector.x / vecSize, vector.y / vecSize);
        return unitVec;
    }

    /**
     *  计算弹道球位置信息，返回信息数组
     * */
    public figureBallOnLine(posA: cc.Vec2, posB: cc.Vec2): cc.Vec2[] {
        let sideA: number = posB.x - posA.x;
        let sideB: number = posB.y - posA.y;
        let absSideA: number = Math.abs(posA.x - posB.x);
        let absSideB: number = Math.abs(posA.y - posB.y);
        let distance: number = Math.sqrt(absSideA * absSideA + absSideB * absSideB);
        let count: number = Math.floor(distance / 60);
        //cc.log(count - 1);
        let ballPosArray: cc.Vec2[] = [];
        for (let i = 1; i < count; i++) {
            ballPosArray.push(cc.v2(posA.x + i * (sideA / count), posA.y + i * (sideB / count)));
        }
        return ballPosArray;
    }


    public reflectDeal(posArray: cc.Vec2[], reflectPos: Reflect) {
        let length: number = posArray.length;
        if (length < 2) {
            //轨迹小于2时不产生反射
            return ;
        } else {
            let posA: cc.Vec2 = cc.v2(posArray[length - 1]);
            let posB: cc.Vec2 = cc.v2(posArray[length - 2]);
            switch(reflectPos.reflectSide) {
                case SIDE.LEFT:
                case SIDE.RIGHT:
                posA.y = reflectPos.position.y * 2 - posA.y;
                posB.y = reflectPos.position.y * 2 - posB.y;
                break;

                case SIDE.TOP:
                posA.x = reflectPos.position.x * 2 - posA.x;
                posB.x = reflectPos.position.x * 2 - posB.x;
                break;

                default:
                break;
            }
            posArray.push(posA);
            posArray.push(posB);
        }
    }

    private init() {
        this.brickStateArray = [];
        this.brickPosArray = [];
        //棋盘设置宽高为11和20
        this.boardWidth = 11;
        this.boardHeight = 20;
        this.correctValue = 10;
        //注意初始化的顺序不可变换
        this.initPosArray();
        this.initStateArray();

        this.gameMap = new GameMap();
        this.configMap();
    }

    /**
     * 砖块状态数组赋值初始化
     */
    private initStateArray() {
        for (let i = 0; i < this.boardHeight; i++) {
            this.brickStateArray[i] = [];
            for (let j = 0; j < this.boardWidth; j++) {
                let temp: Brick = new Brick();
                this.brickStateArray[i][j] = temp;
                this.brickStateArray[i][j].type = BRICKTYPE.EMPTY;
            }
        }
        //将事先计算完成的砖块真实坐标赋值给砖块状态数组
        for (let i = 0; i < this.boardHeight; i++) {
            for (let j = 0; j < this.boardWidth; j++) {
                this.brickStateArray[i][j].position = cc.v2(this.brickPosArray[i][j]);
            }
        }
    }

    /**
     * 计算砖块真实坐标
     */
    private initPosArray() {
        for (let i = 0; i < this.boardHeight; i++) {
            for (let j = 0; j < this.boardWidth; j++) {
                this.brickPosArray[i] = [];
            }
        }
        //先初始化一行一列
        this.brickPosArray[0][0] = cc.v2(BRICKSIZE / 2, BRICKSIZE / 2);
        //初始化第一列，用于对齐
        for (let i = 1; i < this.boardHeight; i++) {
            this.brickPosArray[i][0] = cc.v2(BRICKSIZE / 2 + this.correctValue, this.brickPosArray[i - 1][0].y + BRICKSIZE);
        }
        for (let i = 0; i < this.boardHeight; i++) {
            for (let j = 1; j < this.boardWidth; j++) {
                this.brickPosArray[i][j] = cc.v2(this.brickPosArray[i][j - 1].x + BRICKSIZE,
                    this.brickPosArray[i][j - 1].y);
            }
        }
        //对齐原点
        for (let i of this.brickPosArray) {
            for (let j of i) {
                j.subSelf(cc.v2(this.gameWidth / 2, this.gameHeight / 2));
            }
        }
    }

    /**
     * 配置地图
     */
    private configMap() {
        //获取地图
        let maze: number[][] = this.gameMap.getGameMap(0);
        //length用于上下翻转地图，使得更加符合地图配置
        let length: number = this.brickStateArray.length;
        for (let i = 0; i < this.brickStateArray.length; i++) {
            for (let j = 0; j < this.brickStateArray[i].length; j++) {
                if (maze[i][j] != undefined) {
                    this.brickStateArray[length - i - 1][j].type = maze[i][j];
                }
            }
        }
    }

    /**
     * 判断点是否在画面内
     * @param pos 
     */
    private isContain(pos: cc.Vec2): boolean {
        if (pos.x > -this.gameWidth / 2
            && pos.y > -this.gameHeight / 2
            && pos.x < this.gameWidth / 2
            && pos.y < this.gameHeight / 2) {
            return true;
        } else {
            return false;
        }
    }
}
