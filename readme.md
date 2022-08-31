Markpiece :cheese:
==================

> Customizable Markdown Parser


Install
-------
1. I share Markpiece with npm, it can be easily installed in a node environment.
    ```
    npm i markpiece
    ```

    or

    ```
    yarn add markpiece
    ```

1. Finish :tada:


Usage
-----
1. Import `MpParser` from `markpiece` and instantiate it.
    ``` typescript
    import { MpParser } from 'markpiece'
    
    let parser = new MpParser()
    ```

1. Markpiece translates from Markdown (`string`) to HTML by `render` method.
    ``` typescript
    let html = parser.render('# Hello Markpiece :cheese:')
    ```

1. Done :tada:


Reference
---------
Click below for detailed instructions (e.g. customization).

[Reference (English)](https://folklore.icu/markpiece/ref/en/)