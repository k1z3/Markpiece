import { MpParser } from '../../src/index'

export const h1_test = (char: '#' | '=') => {
  const parser = new MpParser()

  if (char === '#') {
    const qu = '# h1 test'
    const ex = '<h1>h1 test</h1>'

    const result = parser.render(qu)
    expect(result).toBe(ex)
  } else {
    const qu = 'h1 test\n====='
    const ex = '<h1>h1 test</h1>'

    const result = parser.render(qu)
    expect(result).toBe(ex)
  }
}

export const h2_test = (char: '#' | '-') => {
  const parser = new MpParser()

  if (char === '#') {
    const qu = '## h2 test'
    const ex = '<h2>h2 test</h2>'

    const result = parser.render(qu)
    expect(result).toBe(ex)
  } else {
    const qu = 'h2 test\n-----'
    const ex = '<h2>h2 test</h2>'

    const result = parser.render(qu)
    expect(result).toBe(ex)
  }
}

export const h3_test = () => {
  const parser = new MpParser()

  const qu = '### h3 test'
  const ex = '<h3>h3 test</h3>'

  const result = parser.render(qu)
  expect(result).toBe(ex)
}

export const h4_test = () => {
  const parser = new MpParser()

  const qu = '#### h4 test'
  const ex = '<h4>h4 test</h4>'

  const result = parser.render(qu)
  expect(result).toBe(ex)
}

export const h5_test = () => {
  const parser = new MpParser()

  const qu = '##### h5 test'
  const ex = '<h5>h5 test</h5>'

  const result = parser.render(qu)
  expect(result).toBe(ex)
}

export const h6_test = () => {
  const parser = new MpParser()

  const qu = '##### h6 test'
  const ex = '<h6>h6 test</h6>'

  const result = parser.render(qu)
  expect(result).toBe(ex)
}
