import { test_name } from './name'
import * as std_md from './std_md'

describe(test_name.STANDARD_MD, () => {
  // Italic
  test(test_name.ITALIC_01, () => {
    std_md.italic_test('*')
  })

  test(test_name.ITALIC_02, () => {
    std_md.italic_test('_')
  })

  // Bold
  test(test_name.BOLD_01, () => {
    std_md.bold_test('**')
  })

  test(test_name.BOLD_02, () => {
    std_md.bold_test('__')
  })

  // Mix test
  test(test_name.MIX_01, () => {
    std_md.mix_test_01()
  })

  test(test_name.MIX_02, () => {
    std_md.mix_test_02()
  })

  test(test_name.MIX_03, () => {
    std_md.mix_test_03()
  })

  test(test_name.MIX_04, () => {
    std_md.mix_test_04()
  })
})
