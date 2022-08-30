export declare const MatchType: {
    readonly PRIORITY: 1;
    readonly UNIVERSAL: 2;
    readonly LINE: 4;
    readonly BLOCK: 8;
    readonly BLOCK_EXCLUDE: 16;
};
export declare class MpString {
    readonly result: string;
    readonly embed: string;
    constructor(result: string, embed?: string);
}
export declare class Piece {
    readonly name: string;
    readonly regex: RegExp[];
    readonly match_callback: (arg: string[]) => MpString | string | null;
    readonly type: number;
    readonly finally_callback: (() => any);
    readonly limit_lines: number;
    readonly strict: boolean;
    index: number;
    constructor(name: string, regex: RegExp[], match_callback: (arg: string[]) => MpString | string | null, type: number, finally_callback: (() => any), limit_lines?: number, strict?: boolean);
}
