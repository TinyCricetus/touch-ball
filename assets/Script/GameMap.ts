import { BRICKTYPE } from "./BrickData";

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
            [BRICKTYPE.SQUARE, BRICKTYPE.SQUARE, BRICKTYPE.SQUARE],
            [],
            [],
            [],
            [],
            [BRICKTYPE.SQUARE, BRICKTYPE.EMPTY,  BRICKTYPE.SQUARE],
            [0, 0, 0, 0, 0, BRICKTYPE.SQUARE, BRICKTYPE.SQUARE, BRICKTYPE.SQUARE],
            [],
            [],
            [],
            [BRICKTYPE.SQUARE, BRICKTYPE.EMPTY, BRICKTYPE.TRIANGLE_LEFT_TOP],
            [],
            [],
            [],
            [],
            [BRICKTYPE.SQUARE, BRICKTYPE.SQUARE, BRICKTYPE.SQUARE],
            [],
            [],
            [],
        ];

        this.gameMapArray.push(this.gameMap);
    }
}
