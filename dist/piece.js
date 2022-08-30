export const MatchType = {
    PRIORITY: 1,
    UNIVERSAL: 2,
    LINE: 4,
    BLOCK: 8,
    BLOCK_EXCLUDE: 16, // 複数行
};
export class MpString {
    constructor(result, embed = "") {
        this.result = result;
        this.embed = embed;
    }
}
export class Piece {
    constructor(name, regex, match_callback, type = MatchType.UNIVERSAL, finally_callback, limit_lines = 0, strict = false) {
        this.name = name;
        this.regex = regex;
        this.match_callback = match_callback;
        this.type = type;
        this.finally_callback = finally_callback;
        this.limit_lines = limit_lines;
        this.strict = strict;
        this.index = 0;
    }
}
//# sourceMappingURL=piece.js.map