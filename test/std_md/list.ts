import { MpParser } from '../../src/index'

export const ul_test = () => {
  const parser = new MpParser()

  const qu = '- A\n- B\n  - C\n    D\n- E'
  const ex1 = '<ul><li><p>C<br>D</p></li></ul>'
  const ex2 = `<ul><li><p>A</p></li><li><p>B</p>${ex1}</li><li><p>E</p></li></ul>`

  const result = parser.render(qu)
  expect(result).toBe(ex2)
}
