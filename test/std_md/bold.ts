import { MpParser } from '../../src/index'

export const bold_test = (char: '**' | '__') => {
  const parser = new MpParser()
  const qu = `${char}Bold test${char}`
  const ex = '<p><b>Bold test</b></p>'

  const result = parser.render(qu)
  expect(result).toBe(ex)
}
