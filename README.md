# 文字脫出網頁版

這是文字脫出原作者寫的網頁版文字脫出。網站入口是index.html。

cd至根目錄，然後輸入npm run build，即可將TypeScript（簡稱ts）編譯成JavaScript（簡稱js）。使用Webpack打包。

「npm run build」為production build，沒有包含source map。source map是用來將js的行數轉為原本ts的行數。

「npm run build:dev」為development build，有包含source map。

table資料夾內的xlsx檔是關卡企劃。在專案根目錄輸入「npm run tables」即可將xlsx轉成json。轉換腳本只使用Node內建模組，不再依賴有漏洞的`xlsx`套件。

遊戲邏輯條件與結果寫在json裡，會由`src/GameState.ts`的白名單解譯器執行，不再使用`new Function` / `eval`。