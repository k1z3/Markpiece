import { MatchType, Piece, MpString } from './piece';
import { emoji } from './emoji';
/**
  Markdown Parser
*/
export class MpParser {
    /**
     * コンストラクタ
     * @param config 設定ファイル読み込み (将来的な機能)
     */
    constructor(config = "") {
        this.piece = [];
        this.piece_universal = [];
        this.piece_universal_priority = [];
        this.emoji_table = emoji;
        this.universal_regex = / /;
        this.universal_priority_regex = / /;
        this.protect_sign = "\f";
        /**
         * 一致するPieceを探索する
         *
         * @param list 探索する文字列配列ブロック
         * @param index 探索を開始する文字列配列ブロックのインデックス
         * @param piece 任意のPiece配列 (default: null)
         * @param matchtype 探索するMatchType (default: MatchType.BLOCK + MatchType.BLOCK_EXCLUDE + MatchType.LINE + MatchType.UNIVERSAL)
         * @returns 探索でヒットしたPiece
         */
        this.piece_match = (list, index, piece = null, matchtype = MatchType.BLOCK + MatchType.BLOCK_EXCLUDE + MatchType.LINE + MatchType.UNIVERSAL) => {
            let flag = false;
            let result = null;
            if (!piece) {
                piece = this.piece;
            }
            piece.forEach(el => {
                if (!flag && (matchtype & el.type)) {
                    /* matchを探索する */
                    let match = list[index].match(el.regex[0]);
                    if (match) {
                        if (el.type === MatchType.BLOCK) {
                            el.index = list.length;
                            let list_length = el.limit_lines !== 0 ? Math.min(index + el.limit_lines, list.length) : list.length;
                            for (let i = index + 1; i < list_length; i++) {
                                if (list[i].match(el.regex[1])) {
                                    result = el;
                                    result.index = i + 1;
                                    flag = true;
                                    break;
                                }
                            }
                            if (result === null && !el.strict) {
                                result = el;
                                result.index = list.length;
                                flag = true;
                            }
                        }
                        else if (el.type === MatchType.BLOCK_EXCLUDE) {
                            let list_length = el.limit_lines !== 0 ? Math.min(index + el.limit_lines, list.length) : list.length;
                            for (let i = index + 1; i < list_length; i++) {
                                if (!list[i].match(el.regex[1])) {
                                    result = el;
                                    result.index = i;
                                    flag = true;
                                    break;
                                }
                            }
                            if (result === null && !el.strict) {
                                result = el;
                                result.index = list.length;
                                flag = true;
                            }
                        }
                        else if (el.type === MatchType.LINE) {
                            result = el;
                            flag = true;
                        }
                    }
                }
            });
            let match_univ_priority = list[index].match(this.universal_priority_regex);
            if (!flag && match_univ_priority !== null) {
                this.piece_universal_priority.forEach(el => {
                    if (!flag && (matchtype & el.type)) {
                        /* matchを探索する */
                        let match = match_univ_priority.toString().match(el.regex[0]);
                        if (match) {
                            result = el;
                            flag = true;
                        }
                    }
                });
            }
            let match_univ = list[index].match(this.universal_regex);
            if (!flag && match_univ !== null) {
                this.piece_universal.forEach(el => {
                    if (!flag && (matchtype & el.type)) {
                        /* matchを探索する */
                        let match = match_univ.toString().match(el.regex[0]);
                        if (match) {
                            result = el;
                            flag = true;
                        }
                    }
                });
            }
            return result;
        };
        /** Pieceを適用した文字列を返す
         *
         * @param block Pieceを適用する文字列配列
         * @param insert_tag 挿入すべきタグ (default: 'p')
         * @returns Piece適用後の結果
         */
        this.standard_apply_piece = (block, insert_tag = 'p') => {
            let start_insert_tag = insert_tag ? `<${insert_tag}>` : '';
            let end_insert_tag = insert_tag ? `</${insert_tag}>` : '';
            let protect_stack = [];
            let pflag = false;
            // markdown 解析
            for (let a = 0; a < block.length; a++) {
                let piece = this.piece_match(block, a, null, MatchType.BLOCK + MatchType.BLOCK_EXCLUDE + MatchType.LINE); // match する Piece があるかを検索する
                let protect_count_before = protect_stack.length;
                let block_flag = false;
                let line_flag = false;
                // 一致する Piece が存在する場合
                if (piece) {
                    let index = piece.index;
                    if (piece.type & (MatchType.BLOCK + MatchType.BLOCK_EXCLUDE)) {
                        let result = piece.match_callback(block.slice(a, index));
                        for (let i = a; i < index; i++) {
                            block[i] = "";
                        }
                        if (result) {
                            if (typeof result === 'string') {
                                block[index - 1] = result;
                            }
                            else {
                                block[index - 1] = result.result;
                                protect_stack.push(result.embed);
                            }
                            block_flag = true;
                            line_flag = true;
                        }
                        if (pflag) {
                            block[a - 1] = block[a - 1] + end_insert_tag;
                            pflag = false;
                        }
                    }
                    else if (piece.type & MatchType.LINE) {
                        let result = piece.match_callback([block[a]]);
                        if (typeof result === 'string') {
                            block[a] = result;
                        }
                        else {
                            block[index - 1] = result.result;
                            protect_stack.push(result.embed);
                        }
                        line_flag = true;
                        if (pflag) {
                            block[a - 1] = block[a - 1] + end_insert_tag;
                            pflag = false;
                        }
                    }
                    if (block_flag) {
                        a = index - 1;
                    }
                }
                // MatchType.UNIVERSAL PRIORITY の探索
                let pieceu_p = this.piece_match(block, a, null, MatchType.UNIVERSAL + MatchType.PRIORITY); // match する Piece があるかを検索する
                let count = 0;
                while (pieceu_p) {
                    let match = block[a].match(pieceu_p.regex[0]);
                    let target = match[0];
                    let protect_count = (block[a].slice(0, match.index).match(RegExp(this.get_protect_sign(), 'g')) || []).length;
                    let result = pieceu_p.match_callback([target]);
                    if (typeof result === 'string') {
                        block[a] = block[a].replace(target, result);
                    }
                    else {
                        block[a] = block[a].replace(target, result.result);
                        protect_stack.splice(protect_count_before + protect_count, 0, result.embed);
                    }
                    pieceu_p = this.piece_match(block, a, null, MatchType.UNIVERSAL + MatchType.PRIORITY);
                    count++; // TODO: 探索最大数を設定できるようにする
                }
                // MatchType.UNIVERSAL の探索
                let pieceu = this.piece_match(block, a, null, MatchType.UNIVERSAL); // match する Piece があるかを検索する
                count = 0;
                while (pieceu) {
                    let match = block[a].match(pieceu.regex[0]);
                    let target = match[0];
                    let protect_count = (block[a].slice(0, match.index).match(RegExp(this.get_protect_sign(), 'g')) || []).length;
                    let result = pieceu.match_callback([target]);
                    if (typeof result === 'string') {
                        block[a] = block[a].replace(target, result);
                    }
                    else {
                        block[a] = block[a].replace(target, result.result);
                        protect_stack.splice(protect_count_before + protect_count, 0, result.embed);
                    }
                    pieceu = this.piece_match(block, a, null, MatchType.UNIVERSAL);
                    count++; // TODO: 探索最大数を設定できるようにする
                }
                // universal 以外で一致する Piece が存在しなかった場合
                if (!line_flag) {
                    // pタグ付与
                    if (a == 0) {
                        if (block[a] !== "") {
                            block[a] = start_insert_tag + block[a];
                            pflag = true;
                        }
                    }
                    else if (block[a - 1] === "") {
                        if (block[a] === "") {
                            block[a - 1] = "<br>";
                        }
                        else {
                            block[a] = start_insert_tag + block[a];
                            pflag = true;
                        }
                    }
                    else {
                        if (pflag && block[a] === "") {
                            block[a - 1] = block[a - 1] + end_insert_tag;
                            pflag = false;
                        }
                        else if (pflag && block[a] !== "") {
                            block[a - 1] = block[a - 1] + "<br>";
                        }
                        else if (!pflag && block[a] !== "") {
                            block[a] = start_insert_tag + block[a];
                            pflag = true;
                        }
                    }
                }
            }
            if (pflag) {
                block[block.length - 1] = block[block.length - 1] + end_insert_tag;
            }
            let result = block.join('');
            // protectした文字を元に戻す
            protect_stack.forEach((el) => {
                result = result.replace(this.get_protect_sign(), el);
            });
            return result;
        };
        /* =========== */
        this.code_block = (match) => {
            let space = match[0].match(/^\s*/).toString().length;
            let start = match[0].match(/^    +.*/) ? 0 : 1;
            let end = match[match.length - 1].match("```") ? 1 : 0;
            for (let i = start; i < match.length - end; i++) {
                for (let j = 0; j < space; j++) {
                    if (match[i][0] === " ") {
                        match[i] = match[i].slice(1);
                    }
                    else {
                        break;
                    }
                }
                match[i] = this.escape_html(match[i]);
            }
            let result = new MpString(this.get_protect_sign(), "<pre><code>" + match.slice(start, match.length - end).join("\n") + "</code></pre>");
            return result;
        };
        this.table = (match) => {
            let align_th = [];
            let align_td = [];
            let config_exist = false;
            let header_exist = true;
            // 2番目の設定の存在確認と取得
            if (match.length > 1 && match[1].match(/ *\:*---+\:* *\|/g)) {
                let row = match[1].match(/ *\:*---+\:* *\|/g);
                for (let i = 0; i < row.length; i++) {
                    if (row[i].match(/ *---+\:\: *\|/)) {
                        align_td.push(' style="text-align:right;"');
                        align_th.push(' style="text-align:right;"');
                    }
                    else if (row[i].match(/ *\:\:---+ *\|/)) {
                        align_td.push(' style="text-align:left;"');
                        align_th.push(' style="text-align:left;"');
                    }
                    else if (row[i].match(/ *\:---+\: *\|/)) {
                        align_td.push(' style="text-align:center;"');
                        align_th.push(' style="text-align:center;"');
                    }
                    else if (row[i].match(/ *---+\: *\|/)) {
                        align_td.push(' style="text-align:right;"');
                        align_th.push(' style="text-align:center;"');
                    }
                    else {
                        align_td.push(' style="text-align:left;"');
                        align_th.push(' style="text-align:center;"');
                    }
                }
                config_exist = true;
                match.splice(1, 1); // 設定行の削除
            }
            else {
                let row = match[0].match(/.*?\|/g).slice(1);
                for (let i = 0; i < row.length; i++) {
                    align_td.push(' style="text-align:left;"');
                    align_th.push(' style="text-align:center;"');
                }
            }
            // 設定項目が存在 かつ ヘッダー行に何もない場合にはフラグを立てる
            if (config_exist && match[0].match(/^\|( *\|)+ *$/)) {
                header_exist = false;
            }
            // 再帰的にリスト内要素を探索する
            for (let i = 0; i < match.length; i++) {
                // UNIVERSAL (PRIORITY) の適用
                let protect_stack = [];
                let protect_row_count = [];
                let pieceu_p = this.piece_match([match[i]], 0, null, MatchType.UNIVERSAL + MatchType.PRIORITY); // match する pieceu があるかを検索する
                while (pieceu_p) {
                    let select = match[i].match(pieceu_p.regex[0]);
                    let target = select[0];
                    let protect_count = (match[i].slice(0, select.index).match(RegExp(this.get_protect_sign(), 'g')) || []).length;
                    let result = pieceu_p.match_callback([target]);
                    if (typeof result === 'string') {
                        match[i] = match[i].replace(target, result);
                    }
                    else {
                        match[i] = match[i].replace(target, result.result);
                        protect_stack.splice(protect_count, 0, result.embed);
                    }
                    pieceu_p = this.piece_match([match[i]], 0, null, MatchType.UNIVERSAL + MatchType.PRIORITY);
                }
                // 行の取得と前処理
                let row = match[i].match(/.*?\|/g).slice(1);
                let colspan = 1;
                for (let j = 0; j < row.length; j++) {
                    row[j] = row[j].slice(0, row[j].length - 1);
                    protect_row_count.push((row[j].match(RegExp(this.get_protect_sign(), 'g')) || []).length);
                }
                // UNIVERSAL を適用し結合
                for (let j = row.length - 1; j >= 0; j--) {
                    if (row[j].match(/^ *:: *$/)) {
                        row[j] = "";
                        colspan++;
                        continue;
                    }
                    if (align_td.length - 1 < j) {
                        row[j] = "";
                        continue;
                    }
                    let protect_stack = [];
                    let pieceu = this.piece_match([row[j]], 0, null, MatchType.UNIVERSAL); // match する pieceu があるかを検索する
                    while (pieceu) {
                        let match = row[j].match(pieceu.regex[0]);
                        let target = match[0];
                        let protect_count = (row[j].slice(0, match.index).match(RegExp(this.get_protect_sign(), 'g')) || []).length;
                        let result = pieceu.match_callback([target]);
                        if (typeof result === 'string') {
                            row[j] = row[j].replace(target, result);
                        }
                        else {
                            row[j] = row[j].replace(target, result.result);
                            let protect_count_before = 0;
                            for (let k = 0; k < j; k++) {
                                protect_count_before += protect_row_count[k];
                            } // 現在の列以前に含まれる秘匿文字を計算
                            protect_stack.splice(protect_count_before + protect_count, 0, result.embed);
                            protect_row_count[j] += (target.match(RegExp(this.get_protect_sign(), 'g')) || []).length;
                            ;
                        }
                        pieceu = this.piece_match([row[j]], 0, null, MatchType.UNIVERSAL);
                    }
                    row[j] = (i === 0 && config_exist) ? `<th${align_th[j]} colspan="${colspan}">${row[j]}</th>` : `<td${align_td[j]} colspan="${colspan}">${row[j]}</td>`;
                    colspan = 1;
                }
                // protectした文字を元に戻す
                let tmp = row.join("");
                protect_stack.forEach((el) => {
                    tmp = tmp.replace(this.get_protect_sign(), el);
                });
                match[i] = "<tr>" + tmp + "</tr>";
            }
            if (header_exist) {
                match[0] = "<thead>" + match[0] + "</thead>";
            }
            else {
                match[0] = "";
            }
            if (match.length > 1) {
                match[1] = "<tbody>" + match[1];
                match[match.length - 1] = match[match.length - 1] + "</tbody>";
            }
            let result = new MpString(this.get_protect_sign(), "<table>" + match.join("") + "</table>");
            return result;
        };
        this.ulist = (match) => {
            // 再帰的にリスト内要素を探索する
            for (let i = 0; i < match.length; i++) {
                if (match[i].match(/^(\* *\* *\* *(\*| )*|_ *_ *_ *(_| )*|- *- *- *(-| )*)$/)) {
                    match[i] = "</ul>" + match[i].replace(/^(\* *\* *\* *(\*| )*|_ *_ *_ *(_| )*|- *- *- *(-| )*)$/, "<hr>") + "<ul>";
                }
                else if (match[i].match(/^[-\+\*] /)) {
                    if (i !== 0) {
                        match[i - 1] += "</li>";
                    }
                    // 先頭に半角スペース2つ以上ある行をブロックとして取得
                    let block = [];
                    for (let a = i + 1; a < match.length; a++) {
                        if (!match[a].match(/(^  |^ *$)/)) {
                            block = match.slice(i, a);
                            break;
                        }
                    }
                    if (block.length === 0) {
                        block = match.slice(i, match.length);
                    }
                    // ブロックの半角スペース2つを削除
                    for (let a = 0; a < block.length; a++) {
                        block[a] = block[a].slice(2, block[a].length);
                    }
                    let block_length = block.length;
                    let tmp = this.standard_apply_piece(block);
                    // ブロックの結合
                    for (let a = i; a < i + block_length; a++) {
                        match[a] = "";
                    }
                    match[i + block_length - 1] = "<li>" + tmp;
                    i += block_length - 1;
                }
            }
            match[match.length - 1] += "</li>";
            let result = new MpString(this.get_protect_sign(), "<ul>" + match.join("") + "</ul>");
            return result;
        };
        this.olist = (match) => {
            let start_counter = match[0].match(/^\d+/)[0];
            // 再帰的にリスト内要素を探索する
            for (let i = 0; i < match.length; i++) {
                if (match[i].match(/^\d+\. /)) {
                    if (i !== 0) {
                        match[i - 1] += "</li>";
                    }
                    // 先頭に半角スペース2つ以上ある行をブロックとして取得
                    let block = [];
                    for (let a = i + 1; a < match.length; a++) {
                        if (!match[a].match(/(^  |^ *$)/)) {
                            block = match.slice(i, a);
                            break;
                        }
                    }
                    if (block.length === 0) {
                        block = match.slice(i, match.length);
                    }
                    // ブロックの半角スペース2つを削除
                    for (let a = 0; a < block.length; a++) {
                        block[a] = block[a].slice(2, block[a].length);
                    }
                    let block_length = block.length;
                    let tmp = this.standard_apply_piece(block);
                    // ブロックの結合
                    for (let a = i; a < i + block_length; a++) {
                        match[a] = "";
                    }
                    match[i + block_length - 1] = "<li>" + tmp;
                    i += block_length - 1;
                }
            }
            match[match.length - 1] += "</li>";
            let result = new MpString(this.get_protect_sign(), `<ol start='${start_counter}'>` + match.join("") + "</ol>");
            return result;
        };
        this.blockquote = (match) => {
            let br_flag = false;
            let protect_stack = [];
            // 下処理
            for (let i = 0; i < match.length; i++) {
                match[i] = match[i].match(/^> /) ? match[i].replace(/^> /, '') : match[i].replace(/^>/, '');
            }
            let tmp = this.standard_apply_piece(match);
            let result = new MpString(this.get_protect_sign(), "<blockquote>" + tmp + "</blockquote>");
            return result;
        };
        this.h1 = (match) => {
            let target;
            if (match.length === 1) {
                target = match[0];
                target = target.replace(/^# +/, "<h1>") + "</h1>";
            }
            else if (match.length === 2) {
                target = match[0];
                target = "<h1>" + target + "</h1>";
            }
            return target;
        };
        this.h2 = (match) => {
            let target;
            if (match.length === 1) {
                target = match[0];
                target = target.replace(/^## +/, "<h2>") + "</h2>";
            }
            else if (match.length === 2) {
                target = match[0];
                target = "<h2>" + target + "</h2>";
            }
            return target;
        };
        this.h3 = (match) => {
            let target = match[0];
            target = target.replace(/^### +/, "<h3>");
            target += "</h3>";
            return target;
        };
        this.h4 = (match) => {
            let target = match[0];
            target = target.replace(/^#### +/, "<h4>");
            target += "</h4>";
            return target;
        };
        this.h5 = (match) => {
            let target = match[0];
            target = target.replace(/^##### +/, "<h5>");
            target += "</h5>";
            return target;
        };
        this.h6 = (match) => {
            let target = match[0];
            target = target.replace(/^###### +/, "<h6>");
            target += "</h6>";
            return target;
        };
        this.hr = (match) => {
            let target = match[0];
            target = target.replace(/^ *(\* *\* *\* *(\*| )*|_ *_ *_ *(_| )*|- *- *- *(-| )*)$/, "<hr>");
            return target;
        };
        this.italic = (match) => {
            let result = `<i>${match[0].slice(1, match[0].length - 1)}</i>`;
            return result;
        };
        this.bold = (match) => {
            let result = `<b>${match[0].slice(2, match[0].length - 2)}</b>`;
            return result;
        };
        this.strikethrough = (match) => {
            let result = `<s>${match[0].slice(2, match[0].length - 2)}</s>`;
            return result;
        };
        this.insert = (match) => {
            let result = `<ins>${match[0].slice(2, match[0].length - 2)}</ins>`;
            return result;
        };
        this.mark = (match) => {
            let result = `<mark>${match[0].slice(2, match[0].length - 2)}</mark>`;
            return result;
        };
        this.code = (match) => {
            let result = new MpString(this.get_protect_sign(), `<code>${this.escape_html(match[0].slice(1, match[0].length - 1))}</code>`);
            return result;
        };
        this.escape = (match) => {
            let result = new MpString(this.get_protect_sign(), this.escape_html(match[0][1]));
            return result;
        };
        this.image = (match) => {
            let search = match[0].match(/\!\[.+?\]\(.+?\)/)[0];
            let alt = match[0].match(/\!\[.+?\]/)[0];
            let src = match[0].match(/\(.+?\)/)[0];
            let result = `<img src='${src.slice(1, src.length - 1)}' alt='${alt.slice(2, alt.length - 1)}'>`;
            return result;
        };
        this.alink = (match) => {
            let search = match[0].match(/\[.+?\]\(.+?\)/)[0];
            let tag = search.match(/\[.+?\]/)[0];
            let href = search.replace(tag, '').match(/\(.+?\)/)[0];
            let result = `<a href='${href.slice(1, href.length - 1)}'>${tag.slice(1, tag.length - 1)}</a>`;
            return result;
        };
        this.sup = (match) => {
            let result = `<sup>${match[0].slice(1, match[0].length - 1)}</sup>`;
            return result;
        };
        this.sub = (match) => {
            let result = `<sub>${match[0].slice(1, match[0].length - 1)}</sub>`;
            return result;
        };
        this.emoji = (match) => {
            let target = match[0].match(/::?[0-9a-zA-Z_\-\+]+?::?/)[0];
            if (target.match(/::[0-9a-zA-Z_\-\+]+?::/)) {
                let search = target.match(/::[0-9a-zA-Z_\-\+]+?::/);
                target = search[0].slice(2, search[0].length - 2);
                if (target in emoji) {
                    if (emoji[target].type === 'str') {
                        target = match[0].replace(search[0], "<span style='font-size: 2em;'>" + emoji[target].content + "</span>");
                    }
                    else if (emoji[target].type === 'img') {
                        target = match[0].replace(search[0], `<img src='${emoji[target].content}' style='width:auto; height:2em; border-radius:0; vertical-align:sub;'>`);
                    }
                }
                else {
                    target = match[0].replace(search[0], target);
                }
            }
            else {
                let search = target.match(/:[0-9a-zA-Z_\-\+]+?:/);
                target = search[0].slice(1, search[0].length - 1);
                if (target in emoji) {
                    if (emoji[target].type === 'str') {
                        target = match[0].replace(search[0], emoji[target].content);
                    }
                    else if (emoji[target].type === 'img') {
                        target = match[0].replace(search[0], `<img src='${emoji[target].content}' style='width:initial; height:1.3em; border-radius:0; vertical-align:sub;'>`);
                    }
                }
                else {
                    target = match[0].replace(search[0], target);
                }
            }
            return target;
        };
        this.reset_piece();
    }
    /**
     * Markdown形式で記述された文字列をHTMLにレンダリングして返す関数
     * @param markdown markdown形式で記述された文字列
     * @returns HTMLでレンダリングされた文字列
     */
    render(markdown) {
        let result = this.parse(markdown);
        return result;
    }
    /**
     * MarkPieceの変換ルールを初期化する
     */
    reset_piece() {
        this.piece = [];
        this.piece_universal_priority = [];
        this.piece_universal = [];
        this.add_piece('code_block', [/^\s*```/, /^\s*```$/], this.code_block, MatchType.BLOCK); // code-block
        this.add_piece('hr', [/^ *(\* *\* *\* *(\*| )*|_ *_ *_ *(_| )*|- *- *- *(-| )*)$/], this.hr, MatchType.LINE); // hrタグ
        this.add_piece('table', [/^\|(.*\|)+ *$/, /^\|(.*\|)+ *$/], this.table, MatchType.BLOCK_EXCLUDE); // tableタグ
        this.add_piece('ul', [/^[-\+\*] .*/, /(^([-\+\*] |  ).*|^  +$)/], this.ulist, MatchType.BLOCK_EXCLUDE); // ulタグ
        this.add_piece('ol', [/^\d+\. .*/, /(^(\d+\. |  ).*|^  +$)/], this.olist, MatchType.BLOCK_EXCLUDE); // olタグ
        this.add_piece('blockquote', [/^>+ /, /^>+( *| +.+)$/], this.blockquote, MatchType.BLOCK_EXCLUDE); // bockquoteタグ
        this.add_piece('code_block(space)', [/^    +.*/, /^    +.*/], this.code_block, MatchType.BLOCK_EXCLUDE); // code-block
        this.add_piece('h6', [/^###### .*/], this.h6, MatchType.LINE); // h6タグ
        this.add_piece('h5', [/^##### .*/], this.h5, MatchType.LINE); // h5タグ
        this.add_piece('h4', [/^#### .*/], this.h4, MatchType.LINE); // h4タグ
        this.add_piece('h3', [/^### .*/], this.h3, MatchType.LINE); // h3タグ
        this.add_piece('h2', [/^## .*/], this.h2, MatchType.LINE); // h2タグ
        this.add_piece('h1', [/^# .*/], this.h1, MatchType.LINE); // h1タグ
        this.add_piece('h1(under)', [/.+/, /^=====+/], this.h1, MatchType.BLOCK, null, null, 2, true); // h1タグ
        this.add_piece('h2(under)', [/.+/, /^-----+/], this.h2, MatchType.BLOCK, null, null, 2, true); // h2タグ
        this.add_piece('code', [/`.+?`/], this.code, MatchType.UNIVERSAL + MatchType.PRIORITY); // codeタグ
        this.add_piece('escape', [/\\./], this.escape, MatchType.UNIVERSAL + MatchType.PRIORITY); // escape
        this.add_piece('emoji', [/::?[0-9a-zA-Z_\-\+]+?::?/], this.emoji, MatchType.UNIVERSAL); // emoji
        this.add_piece('img', [/\!\[.+?\]\(.+?\)/], this.image, MatchType.UNIVERSAL); // imgタグ
        this.add_piece('a', [/\[.+?\]\(.+?\)/], this.alink, MatchType.UNIVERSAL); // aタグ
        this.add_piece('bold', [/(\*\*)+.+?(\*\*)+|(__)+.+?(__)+/], this.bold, MatchType.UNIVERSAL); // bタグ
        this.add_piece('s', [/~~.+?~~/], this.strikethrough, MatchType.UNIVERSAL); // sタグ
        this.add_piece('ins', [/\+\+.+?\+\+/], this.insert, MatchType.UNIVERSAL); // insタグ
        this.add_piece('mark', [/==.+?==/], this.mark, MatchType.UNIVERSAL); // markタグ
        this.add_piece('i', [/\*+.+?\*+|_+.+?_+/], this.italic, MatchType.UNIVERSAL); // iタグ
        this.add_piece('sup', [/\^.+?\^/], this.sup, MatchType.UNIVERSAL); // supタグ
        this.add_piece('sub', [/~.+?~/], this.sub, MatchType.UNIVERSAL); // subタグ
    }
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
    add_piece(name, regex, match_callback, matchtype, insert_index = null, finally_callback = null, limit_lines = 0, strict = false) {
        let piece = new Piece(name, regex, match_callback, matchtype, finally_callback, limit_lines, strict);
        if (matchtype & (MatchType.BLOCK + MatchType.BLOCK_EXCLUDE + MatchType.LINE)) {
            if (insert_index && insert_index > 0) {
                this.piece.splice(insert_index - 1, 0, piece);
            }
            else {
                this.piece.push(piece);
            }
            // UNIVERSAL (PRIORITY)
        }
        else if (matchtype & MatchType.UNIVERSAL && matchtype & MatchType.PRIORITY) {
            if (insert_index && insert_index > 0) {
                this.piece_universal_priority.splice(insert_index - 1, 0, piece);
            }
            else {
                this.piece_universal_priority.push(piece);
            }
            let array = [];
            this.piece_universal_priority.forEach(el => {
                array.push(el.regex[0]);
            });
            this.universal_priority_regex = this.concat_regexp_or(array);
            // UNIVERSAL
        }
        else if (matchtype & MatchType.UNIVERSAL) {
            if (insert_index && insert_index > 0) {
                this.piece_universal.splice(insert_index - 1, 0, piece);
            }
            else {
                this.piece_universal.push(piece);
            }
            let array = [];
            this.piece_universal.forEach(el => {
                array.push(el.regex[0]);
            });
            this.universal_regex = this.concat_regexp_or(array);
        }
    }
    /**
     * 現在設定されている Piece を除外する
     * @param index 対象の Piece インデックス
     * @param matchtype ルールの形式
     */
    remove_piece(index, matchtype) {
        if (matchtype === (MatchType.UNIVERSAL + MatchType.PRIORITY)) {
            if (index > 0 && index < this.piece_universal_priority.length + 1) {
                this.piece_universal_priority.splice(index - 1, 1);
            }
        }
        else if (matchtype === MatchType.UNIVERSAL) {
            if (index > 0 && index < this.piece_universal.length + 1) {
                this.piece_universal.splice(index - 1, 1);
            }
        }
        else if (matchtype & (MatchType.BLOCK + MatchType.BLOCK_EXCLUDE + MatchType.BLOCK_EXCLUDE)) {
            if (index > 0 && index < this.piece.length + 1) {
                this.piece.splice(index - 1, 1);
            }
        }
    }
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
    rewrite_piece(name, regex, match_callback, matchtype = MatchType.UNIVERSAL, insert_index, finally_callback = null, limit_lines = 0, strict = false) {
        this.remove_piece(insert_index, matchtype);
        this.add_piece(name, regex, match_callback, matchtype, insert_index, finally_callback, limit_lines, strict);
    }
    /**
     * 現在設定されている Piece を文字列形式で取得する
     * @param reverse ルール順を反転して取得する
     * @returns 登録されている MpRule の内容を文字列で出力する
     */
    get_piece(reverse = false) {
        let result = [];
        const type_dict = {
            '2': 'UNIVERSAL',
            '4': 'LINE',
            '8': 'BLOCK',
            '16': 'BLOCK_EXCLUDE', // 複数行
        };
        let counter = 1;
        // 空白埋めする関数
        const count = (c) => {
            let result = c + '';
            for (let i = 0; i < 3 - (c + '').length; i++) {
                result = ' ' + result;
            }
            return result;
        };
        result.push('Piece');
        this.piece.forEach((el) => {
            let elem = `[${count(counter++)}] ${el.name} (${type_dict[(el.type & 30) + '']})`;
            reverse ? result.unshift(elem) : result.push(elem);
        });
        result.push('\n');
        result.push('Piece UNIVERSAL PRIORITY');
        counter = 1;
        this.piece_universal_priority.forEach((el) => {
            let elem = `[${count(counter++)}] ${el.name} (${type_dict[(el.type & 30) + ' PRIORITY']})`;
            reverse ? result.unshift(elem) : result.push(elem);
        });
        result.push('\n');
        result.push('Piece UNIVERSAL');
        counter = 1;
        this.piece_universal.forEach((el) => {
            let elem = `[${count(counter++)}] ${el.name} (${type_dict[(el.type & 30) + '']})`;
            reverse ? result.unshift(elem) : result.push(elem);
        });
        return result.join('\n');
    }
    /**
     * 絵文字を追加する
     * @param name 固有名称 (その名称が使われている場合は上書き)
     * @param content 置き換える文字列
     * @param type content の形式
     */
    add_emoji(name, content, type = 'str') {
        this.emoji_table[name] = { "content": content, "type": type };
    }
    /**
     * 絵文字テーブルを取得する
     * @returns 絵文字が格納された連想配列
     */
    get_emoji_table() {
        return this.emoji_table;
    }
    /**
      * マークダウン文字列を解析しHTML文字列に変換する
      * @param str markdown文字列
      * @returns HTML文字列
      */
    parse(str) {
        let list = str.split('\n');
        let indent = -1;
        let pflag = false;
        let protect_stack = []; // エスケープした文字列を保存する
        for (let a = 0; a < list.length; a++) {
            // インデント処理
            if (indent == -1) {
                indent = list[a].match(/^( )*/)[0].length;
            }
            for (let i = 0; i < indent; i++) {
                list[a] = list[a][0] == ' ' ? list[a].slice(1) : list[a];
            }
        }
        let result = this.standard_apply_piece(list);
        result = result.replace(/\t/g, "");
        // TODO: script記述の削除の有無を設定する
        result = result.replace(/<script[\s\S]*<\/script>/, "");
        result = result.replace(/<script[\s\S]*?>/, "");
        // TODO: style記述の削除の有無を設定する
        result = result.replace(/<style[\s\S]*<\/style>/, "");
        return result;
    }
    /**
     * OR演算子で正規表現を結合したものを返す
     *
     * @param reg_exps 正規表現の格納された配列
     * @param flags 正規表現の処理に関するフラグを設定
     * @returns 結合した正規表現
     */
    concat_regexp_or(reg_exps, flags) {
        for (let i = reg_exps.length - 1; i > 0; i--) {
            reg_exps.splice(i, 0, /|/);
        }
        return RegExp(reg_exps.reduce((acc, cur) => acc + cur.source, ''), flags);
    }
    ;
    /**
     * HTMLエスケープを施した文字列を返すメソッド
     *
     * @param str HTML文字列
     * @returns エスケープ処理を施したHTML文字列
     */
    escape_html(str) {
        if (typeof str !== 'string') {
            return str;
        }
        return str.replace(/[$&'`"<> ]/g, (match) => {
            return {
                '$': '&#036;',
                '&': '&amp;',
                "'": '&#x27;',
                '`': '&#x60;',
                '"': '&quot;',
                '<': '&lt;',
                '>': '&gt;',
                ' ': '&nbsp;',
            }[match];
        });
    }
    /**
     * 変換処理後に他に処理させないためのプロテクト文字を返す
     * @returns プロテクト文字
     */
    get_protect_sign() { return this.protect_sign; }
    /**
     * Piece に紐づけられた finally_callback を呼び出す
     */
    finally_callback() {
        let piece = this.piece.concat(this.piece_universal, this.piece_universal_priority);
        piece.forEach((el) => {
            if (el.finally_callback) {
                el.finally_callback();
            }
        });
    }
}
