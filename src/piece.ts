export const MatchType = {
  PRIORITY: 1, // (変換優先)
  UNIVERSAL: 2, // 単語
  LINE: 4, // 単一行
  BLOCK: 8, // 複数行
  BLOCK_EXCLUDE: 16, // 複数行
} as const

export class MpString {
  readonly result: string
  readonly embed: string

  constructor(result: string, embed: string = '') {
    this.result = result
    this.embed = embed
  }
}

export class Piece {
  readonly name: string
  readonly regex: RegExp[]
  readonly match_callback: (arg: string[]) => MpString | string | null
  readonly type: number
  readonly finally_callback: () => any
  readonly limit_lines: number
  readonly strict: boolean

  /* for system */
  index: number

  constructor(
    name: string,
    regex: RegExp[],
    match_callback: (arg: string[]) => MpString | string | null,
    type: number = MatchType.UNIVERSAL,
    finally_callback: () => any,
    limit_lines: number = 0,
    strict: boolean = false
  ) {
    this.name = name
    this.regex = regex
    this.match_callback = match_callback
    this.type = type
    this.finally_callback = finally_callback
    this.limit_lines = limit_lines
    this.strict = strict

    this.index = 0
  }
}
