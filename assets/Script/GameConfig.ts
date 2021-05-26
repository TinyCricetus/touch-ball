import { BRICK_TYPE, MAP_HEIGHT, MAP_WIDTH } from "./BrickData";
import { BrickInf } from "./GameBoard";



const { ccclass, property } = cc._decorator;

@ccclass
export class GameConfig extends cc.Component {

    @property(cc.Node)
    playGround: cc.Node = null;

    /**
     * 砖块配置
     */
    private brickType: string[][] = null;
    private spriteFrameArray: cc.SpriteFrame[][] = null;
    private spriteAtlas: cc.SpriteAtlas = null;



    /**
     * 地图配置
     */
    private gameMapArray: Array<BrickInf[][]> = null;

    /**
     * 控制主场景加载
     */
    private loadCount: number = 2;
    private loadCnt: number = 0;

    /**
     * 
     * @param kind 
     * @param state 
     */
    public getBlockSpriteFrame(kind: number, state: number): cc.SpriteFrame {
        let serial: number = this.brickTypeToPrefabSerial(kind);
        return this.spriteFrameArray[serial][state];
    }

    public getGameMap(serial: number) {
        if (serial < this.gameMapArray.length) {
            return this.gameMapArray[serial];
        } else {
            console.log("地图加载出现错误!");
            return null;
        }
    }

    public onLoad() {

        this.init();
        let self: GameConfig = this;
        this.gameMapArray = [];

        /**
         * 加载纹理
         */
        cc.loader.loadRes("block/blocks", cc.SpriteAtlas, function (err: Error, sa: cc.SpriteAtlas) {
            self.spriteFrameArray = [];
            for (let i: number = 0; i < self.brickType.length; i++) {
                self.spriteFrameArray[i] = [];
                for (let j: number = 0; j < self.brickType[i].length; j++) {
                    if (self.brickType[i][j] == undefined) {
                        continue;
                    }
                    self.spriteFrameArray[i][j] = sa.getSpriteFrame(self.brickType[i][j]);
                }
            }
            self.loadPlayGround();
        });

        /**
         * 加载地图
         */
        cc.loader.loadRes("maps/map", function (err: Error, mapFile: any) {
            //地图数据默认存储在brickArray数组中
            const configJson = mapFile.json
            const name: string[] = Object.keys(configJson);
            for (let n of name) {
                //let brickObjectArray: object[] = mapFile["brickArray"];
                let gameMap: BrickInf[][] = [];
                for (let i of configJson[n]) {
                    for (let j: number = 0; j < MAP_HEIGHT; j++) {
                        if (!gameMap[j]) gameMap[j] = [];
                        if (i.row != j) {
                            continue;
                        }
                        for (let k: number = 0; k < MAP_WIDTH; k++) {
                            if (i.column != k) {
                                continue;
                            } else {
                                gameMap[j][k] = new BrickInf(i.type, i.life);
                            }
                        }
                    }
                }
                self.gameMapArray.push(gameMap);
            }
            self.loadPlayGround();
        });
    }

    /**
     * 砖块类型转换为资源序列号
     * @param brickType 
     */
    private brickTypeToPrefabSerial(brickType: number): number {
        switch (brickType) {
            case BRICK_TYPE.SQUARE:
                return 1;

            case BRICK_TYPE.TRIANGLE_LEFT_BOTTOM:
                return 3;

            case BRICK_TYPE.TRIANGLE_LEFT_TOP:
                return 6;

            case BRICK_TYPE.TRIANGLE_RIGHT_BOTTOM:
                return 4;

            case BRICK_TYPE.TRIANGLE_RIGHT_TOP:
                return 5;

            default:
                console.log("纹理资源获取出现错误!");
                break;
        }
    }


    private init() {
        this.brickType = [[],
        ["block_1_0",
            "block_1_1",
            "block_1_2",
            "block_1_3",
            "block_1_4",
            "block_1_5",
            "block_1_6",
            "block_1_7",
            "block_1_8",
            "block_1_9",
            "block_1_10"], [],

        ["block_3_0",
            "block_3_1",
            "block_3_2",
            "block_3_3",
            "block_3_4",
            "block_3_5",
            "block_3_6",
            "block_3_7",
            "block_3_8",
            "block_3_9",
            "block_3_10"],

        ["block_4_0",
            "block_4_1",
            "block_4_2",
            "block_4_3",
            "block_4_4",
            "block_4_5",
            "block_4_6",
            "block_4_7",
            "block_4_8",
            "block_4_9",
            "block_4_10"],

        ["block_5_0",
            "block_5_1",
            "block_5_2",
            "block_5_3",
            "block_5_4",
            "block_5_5",
            "block_5_6",
            "block_5_7",
            "block_5_8",
            "block_5_9",
            "block_5_10"],

        ["block_6_0",
            "block_6_1",
            "block_6_2",
            "block_6_3",
            "block_6_4",
            "block_6_5",
            "block_6_6",
            "block_6_7",
            "block_6_8",
            "block_6_9",
            "block_6_10"],
        ];
    }

    private loadPlayGround() {
        this.loadCnt++;
        //console.log(this.loadCnt);
        if (this.loadCnt == this.loadCount) {
            this.playGround.active = true;
        }
    }
}
