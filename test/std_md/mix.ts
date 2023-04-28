import { MpParser } from '../../src/index'

/* --- bold & italic --- */
export const mix_test_001 = () => {
  const parser = new MpParser()
  const qu = '***Mixtest001***'
  const ex = '<p><i><b>Mixtest001</b></i></p>'

  const result = parser.render(qu)
  expect(result).toBe(ex)
}

export const mix_test_002 = () => {
  const parser = new MpParser()
  const qu = '*Mix**test002***'
  const ex = '<p><i>Mix<b>test002</b></i></p>'

  const result = parser.render(qu)
  expect(result).toBe(ex)
}

export const mix_test_003 = () => {
  const parser = new MpParser()
  const qu = '**Mix*test003***'
  const ex = '<p><b>Mix<i>test003</i></b></p>'

  const result = parser.render(qu)
  expect(result).toBe(ex)
}

export const mix_test_004 = () => {
  const parser = new MpParser()
  const qu = '***Mix**test004*'
  const ex = '<p><i><b>Mix</b>test004</i></p>'

  const result = parser.render(qu)
  expect(result).toBe(ex)
}

export const mix_test_005 = () => {
  const parser = new MpParser()
  const qu = '***Mix*test005**'
  const ex = '<p><b><i>Mix</i>test005</b></p>'

  const result = parser.render(qu)
  expect(result).toBe(ex)
}
