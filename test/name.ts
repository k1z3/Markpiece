export const test_name = {
  STANDARD_MD: '2. Markdown standard rule test',
  ITALIC_01: '* -> <i>',
  ITALIC_02: '_ -> <i>',
  BOLD_01: '** -> <b>',
  BOLD_02: '__ -> <b>',
  MIX_01: '*A**B*** -> <i>A<b>B</b></i>',
  MIX_02: '**A*B*** -> <b>A<i>B</i></b>',
  MIX_03: '***A*B** -> <b><i>A</i>B</b>',
  MIX_04: '***A**B* -> <i><b>A</b>B</i>'
}
