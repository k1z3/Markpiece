import { MpParser } from '../../src/index'

export const mix_test_01 = () => {
  const parser = new MpParser()
  const qu = '*Mix**test01***'
  const ex = '<p><i>Mix<b>test01</b></i></p>'

  const result = parser.render(qu)
  expect(result).toBe(ex)
}

export const mix_test_02 = () => {
  const parser = new MpParser()
  const qu = '**Mix*test02***'
  const ex = '<p><b>Mix<i>test02</i></b></p>'

  const result = parser.render(qu)
  expect(result).toBe(ex)
}

export const mix_test_03 = () => {
  const parser = new MpParser()
  const qu = '***Mix**test03*'
  const ex = '<p><i><b>Mix</b>test03</i></p>'

  const result = parser.render(qu)
  expect(result).toBe(ex)
}

export const mix_test_04 = () => {
  const parser = new MpParser()
  const qu = '***Mix*test04**'
  const ex = '<p><b><i>Mix</i>test04</b></p>'

  const result = parser.render(qu)
  expect(result).toBe(ex)
}
