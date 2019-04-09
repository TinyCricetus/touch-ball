

export const BRICK_SIZE: number = 64;

export const MAP_WIDTH: number = 11;
export const MAP_HEIGHT: number = 30;

export const ORIGIN_COLOR: number = 10;

export const enum BRICK_TYPE {
    EMPTY,
    UNBREAKABLE,
    SQUARE,
    TRIANGLE_LEFT_TOP,
    TRIANGLE_LEFT_BOTTOM,
    TRIANGLE_RIGHT_TOP,
    TRIANGLE_RIGHT_BOTTOM,
    SQUARE_DISMISS_ROW,
    SQUARE_DISMISS_COl
}