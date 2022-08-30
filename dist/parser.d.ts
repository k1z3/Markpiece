import { Piece, MpString } from './piece';
/**
  Markdown Parser
*/
export declare class MpParser {
    protected piece: Piece[];
    protected piece_universal: Piece[];
    protected piece_universal_priority: Piece[];
    protected emoji_table: {
        [index: string]: {
            content: string;
            type: string;
        };
    };
    protected universal_regex: RegExp;
    protected universal_priority_regex: RegExp;
    protected protect_sign: string;
    /**
     * コンストラクタ
     * @param config 設定ファイル読み込み (将来的な機能)
     */
    constructor(config?: string);
    /**
     * Markdown形式で記述された文字列をHTMLにレンダリングして返す関数
     * @param markdown markdown形式で記述された文字列
     * @returns HTMLでレンダリングされた文字列
     */
    render(markdown: string): string;
    /**
     * MarkPieceの変換ルールを初期化する
     */
    reset_piece(): void;
    /**
     * Piece を追加する
     * @param name 任意の名称
     * @param regex ルールにヒットするための正規表現
     * @param match_callback ルールにヒットした場合に呼び出して変換を行うコールバック関数
     * @param matchtype ルールの形式
     * @param insert_index ルールの挿入位置
     * @param finally_callback HTMLレンダリングが完了した後に呼び出されるコールバック関数
     * @param limit_lines ルール適用時の行数制限
     * @param strict 厳密なルール適用
     */
    add_piece(name: string, regex: RegExp[], match_callback: ((arg: string[]) => MpString | string | null), matchtype: number, insert_index?: number, finally_callback?: (() => any), limit_lines?: number, strict?: boolean): void;
    /**
     * 現在設定されている Piece を除外する
     * @param index 対象の Piece インデックス
     * @param matchtype ルールの形式
     */
    remove_piece(index: number, matchtype: number): void;
    /**
     * 現在の Piece に上書きする
     * @param name 任意の名称
     * @param regex ルールにヒットするための正規表現
     * @param match_callback ルールにヒットした場合に呼び出して変換を行うコールバック関数
     * @param matchtype ルールの形式
     * @param insert_index 上書きするルールの位置
     * @param finally_callback HTMLレンダリングが完了した後に呼び出されるコールバック関数
     * @param limit_lines ルール適用時の行数制限
     * @param strict 厳密なルール適用
     */
    rewrite_piece(name: string, regex: RegExp[], match_callback: ((arg: string[]) => MpString | string | null), matchtype: number, insert_index: number, finally_callback?: (() => any), limit_lines?: number, strict?: boolean): void;
    /**
     * 現在設定されている Piece を文字列形式で取得する
     * @param reverse ルール順を反転して取得する
     * @returns 登録されている MpRule の内容を文字列で出力する
     */
    get_piece(reverse?: boolean): string;
    /**
     * 絵文字を追加する
     * @param name 固有名称 (その名称が使われている場合は上書き)
     * @param content 置き換える文字列
     * @param type content の形式
     */
    add_emoji(name: string, content: string, type?: string): void;
    /**
     * 絵文字テーブルを取得する
     * @returns 絵文字が格納された連想配列
     */
    get_emoji_table(): {
        [index: string]: {
            content: string;
            type: string;
        };
    };
    /**
      * マークダウン文字列を解析しHTML文字列に変換する
      * @param str markdown文字列
      * @returns HTML文字列
      */
    protected parse(str: string): string;
    /**
     * 一致するPieceを探索する
     *
     * @param list 探索する文字列配列ブロック
     * @param index 探索を開始する文字列配列ブロックのインデックス
     * @param piece 任意のPiece配列 (default: null)
     * @param matchtype 探索するMatchType (default: MatchType.BLOCK + MatchType.BLOCK_EXCLUDE + MatchType.LINE + MatchType.UNIVERSAL)
     * @returns 探索でヒットしたPiece
     */
    piece_match: (list: string[], index: number, piece?: Piece[], matchtype?: number) => Piece | null;
    /** Pieceを適用した文字列を返す
     *
     * @param block Pieceを適用する文字列配列
     * @param insert_tag 挿入すべきタグ (default: 'p')
     * @returns Piece適用後の結果
     */
    standard_apply_piece: (block: string[], insert_tag?: string) => string;
    /**
     * OR演算子で正規表現を結合したものを返す
     *
     * @param reg_exps 正規表現の格納された配列
     * @param flags 正規表現の処理に関するフラグを設定
     * @returns 結合した正規表現
     */
    protected concat_regexp_or(reg_exps: RegExp[], flags?: string): RegExp;
    /**
     * HTMLエスケープを施した文字列を返すメソッド
     *
     * @param str HTML文字列
     * @returns エスケープ処理を施したHTML文字列
     */
    escape_html(str: string): string;
    /**
     * 変換処理後に他に処理させないためのプロテクト文字を返す
     * @returns プロテクト文字
     */
    get_protect_sign(): string;
    /**
     * Piece に紐づけられた finally_callback を呼び出す
     */
    finally_callback(): void;
    private code_block;
    private table;
    private ulist;
    private olist;
    private blockquote;
    private h1;
    private h2;
    private h3;
    private h4;
    private h5;
    private h6;
    private hr;
    private italic;
    private bold;
    private strikethrough;
    private insert;
    private mark;
    private code;
    private escape;
    private image;
    private alink;
    private sup;
    private sub;
    private emoji;
}
