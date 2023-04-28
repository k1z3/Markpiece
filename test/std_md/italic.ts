import { MpParser } from '../../src/index'

export const italic_test = (char: '*' | '_') => {
  const parser = new MpParser()
  const qu = `${char}Italic test${char}`
  const ex = '<p><i>Italic test</i></p>'

  const result = parser.render(qu)
  expect(result).toBe(ex)
}
