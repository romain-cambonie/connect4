export enum Pawn {
    RED = 1,
    YELLOW = -1,
    EMPTY = 0
}

export enum Endgame {
    NOT_WIN,
    RED_WIN
}

const COLUMNS: number = 7;

const ROWS: number = 6;

const BOARD_DIMENSION: number = COLUMNS * ROWS;

const FOUR_REDS: string = [Pawn.RED, Pawn.RED, Pawn.RED, Pawn.RED].toString();

const isFourRed=  (a: number[], startLine: number):boolean=> a.slice(startLine, 4 + startLine).reduce((acc, val) => acc + val, 0) === 4;

class Column {
    constructor(public readonly index: number) {
        if (index < 0 || index > 6) {
            throw new IllegalColumnIndexError();
        }
    }
}

class IllegalColumnIndexError {}

class Grid {
    private pawns: Pawn[] = Array.from({length: BOARD_DIMENSION}).map(() => Pawn.EMPTY);

    private static toOneDimension(column: number, row: number) {
        return column + row * COLUMNS;
    }

    private static nextLineIndex(index: number): number {
        return index + COLUMNS;
    }

    full() {
        return this.pawns.reduce((acc, pawn) => acc && pawn !== Pawn.EMPTY, true);
    }

    getPawnAtPosition(column: number, row: number): Pawn {
        return this.pawns[Grid.toOneDimension(column, row)];
    }

    addPawn(pawn: Pawn, column: Column): Endgame {
        this.insertPawnInPawnsCollection(pawn, column.index);
        return this.endGameState();
    }

    private endGameState() {
        if (this.isRedColumnWin()) {
            return Endgame.RED_WIN;
        }

        return Endgame.NOT_WIN;
    }


    private isRedColumnWin()  {
        const columnZero=[this.pawns[0], this.pawns[7], this.pawns[14], this.pawns[21],this.pawns[28], this.pawns[35]]
        return isFourRed(columnZero, 0)
            || isFourRed(columnZero, 1)
            || isFourRed(columnZero, 2);

    };
    // private isRedColumnWin() {
    //     return [this.pawns[0], this.pawns[7], this.pawns[14], this.pawns[21]].toString() === FOUR_REDS ||
    //         [this.pawns[7], this.pawns[14], this.pawns[21], this.pawns[28]].toString() === FOUR_REDS ||
    //         [this.pawns[14], this.pawns[21], this.pawns[28], this.pawns[35]].toString() === FOUR_REDS;
    // }

    private insertPawnInPawnsCollection(pawn: Pawn, index: number): void {
        const NEXT_LINE_INDEX: number = Grid.nextLineIndex(index);

        if (this.pawns[index] === Pawn.EMPTY) {
            this.pawns[index] = pawn;
        } else if (NEXT_LINE_INDEX < BOARD_DIMENSION) {
            this.insertPawnInPawnsCollection(pawn, NEXT_LINE_INDEX);
        } else {
            throw new RangeError();
        }
    }
}

describe('test connect 4', () => {
    let grid: Grid;
    beforeEach(() => {
        grid = new Grid();
    });
    it('should have an empty grid', () => {
        expect(grid.full()).toEqual(false);
    });
    it('should get Red pawn at position column 0 ', () => {
        grid.addPawn(Pawn.RED, new Column(0));
        expect(grid.getPawnAtPosition(0, 0)).toEqual(Pawn.RED);
    });
    it('should get Yellow at position column 0', () => {
        grid.addPawn(Pawn.YELLOW, new Column(0));
        expect(grid.getPawnAtPosition(0, 0)).toEqual(Pawn.YELLOW)
    });
    it('should get Red at position column 0 and yellow at position 7', () => {
        grid.addPawn(Pawn.RED, new Column(0));
        grid.addPawn(Pawn.YELLOW, new Column(0));
        expect(grid.getPawnAtPosition(0, 0)).toEqual(Pawn.RED)
        expect(grid.getPawnAtPosition(0, 1)).toEqual(Pawn.YELLOW)
    });
    it('should add pawn Red,Yellow,Red: 1 at position column 1', () => {
        grid.addPawn(Pawn.RED, new Column(1));
        grid.addPawn(Pawn.YELLOW, new Column(1));
        grid.addPawn(Pawn.RED, new Column(1));
        expect(grid.getPawnAtPosition(1, 0)).toEqual(Pawn.RED)
        expect(grid.getPawnAtPosition(1, 1)).toEqual(Pawn.YELLOW)
        expect(grid.getPawnAtPosition(1, 2)).toEqual(Pawn.RED)
    });
    it('should not add pawn when column 0 full', () => {
        expect(() => {
            grid.addPawn(Pawn.RED, new Column(0));
            grid.addPawn(Pawn.YELLOW, new Column(0));
            grid.addPawn(Pawn.RED, new Column(0));
            grid.addPawn(Pawn.RED, new Column(0));
            grid.addPawn(Pawn.YELLOW, new Column(0));
            grid.addPawn(Pawn.RED, new Column(0));
            grid.addPawn(Pawn.RED, new Column(0));
        }).toThrow(RangeError);
    });
    it('should not add pawn in column 7 ', () => {
        expect(() => grid.addPawn(Pawn.RED, new Column(7))).toThrow(IllegalColumnIndexError);
    });
    it('should not add pawn in column -1 ', () => {
        expect(() => grid.addPawn(Pawn.RED, new Column(-1))).toThrow(IllegalColumnIndexError);
    });
    it('should be win when we add a red pawn in column 0 and the 3 pawn under it are red', () => {
        grid.addPawn(Pawn.RED, new Column(0));
        grid.addPawn(Pawn.RED, new Column(0));
        grid.addPawn(Pawn.RED, new Column(0));

        const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(0));

        expect(endgame).toEqual(Endgame.RED_WIN);
    });
    it('should be not win when we add a red pawn in column 0 and the 2 pawn under it are red', () => {
        grid.addPawn(Pawn.RED, new Column(0));
        grid.addPawn(Pawn.RED, new Column(0));

        const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(0));

        expect(endgame).toEqual(Endgame.NOT_WIN);
    });
    it('should be win when column 0 state move from [Y R R R] to [Y R R R +R]', () => {
        grid.addPawn(Pawn.YELLOW, new Column(0));
        grid.addPawn(Pawn.RED, new Column(0));
        grid.addPawn(Pawn.RED, new Column(0));
        grid.addPawn(Pawn.RED, new Column(0));

        const endgame: Endgame = grid.addPawn(Pawn.RED, new Column(0));

        expect(endgame).toEqual(Endgame.RED_WIN);
    });
    // TODO: Test endgame conditions
    // TODO: Core / Generic : prints (contrat d'interface ?).
    // TODO: Game loop
});
