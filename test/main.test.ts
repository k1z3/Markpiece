import { test_name } from './name'
import * as std_md from './std_md'

describe(test_name.STANDARD_MD, () => {
  test(test_name.BOLD_1, () => {
    std_md.bold_test('**')
  })
})
