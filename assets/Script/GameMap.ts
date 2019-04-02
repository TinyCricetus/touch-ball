import { BRICK_TYPE } from "./BrickData";

export class GameMap {

    private gameMap: number[][] = null;
    private gameMapArray: Array<number[][]> = null;

    public constructor() {
        this.init();
    }

    public getGameMap(serial: number) {
        if (this.gameMapArray[serial] == null) {
            cc.log("地图读取错误!");
        } else {
            return this.gameMapArray[serial];
        }
    }


    private init() {
        this.gameMapArray = new Array<number[][]>();
        //这是测试，实际地图应该从文件读取
        this.gameMap = [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [BRICK_TYPE.SQUARE, BRICK_TYPE.SQUARE,BRICK_TYPE.SQUARE, BRICK_TYPE.SQUARE, BRICK_TYPE.SQUARE, BRICK_TYPE.SQUARE, 0, 0, 0, BRICK_TYPE.SQUARE, BRICK_TYPE.SQUARE],
            [],
            [],
            [],
            [BRICK_TYPE.SQUARE, BRICK_TYPE.SQUARE, BRICK_TYPE.SQUARE, BRICK_TYPE.SQUARE, BRICK_TYPE.SQUARE, BRICK_TYPE.SQUARE, 0, 0, 0, BRICK_TYPE.SQUARE, BRICK_TYPE.SQUARE],
            [],
            [],
            [],
            [],
            [],
            [],
        ];

        this.gameMapArray.push(this.gameMap);
    }
}
