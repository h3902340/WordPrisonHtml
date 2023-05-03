# 文字脫出網頁版

這是文字脫出原作者寫的網頁版文字脫出。網站入口是index.html。

cd至根目錄，然後輸入npm run build，即可將TypeScript（簡稱ts）編譯成JavaScript（簡稱js）。使用Webpack打包。

「npm run build」為production build，沒有包含source map。source map是用來將js的行數轉為原本ts的行數。

「npm run build:dev」為development build，有包含source map。

table資料夾內的xlsx檔是關卡企劃。在專案根目錄輸入「node ./xlsxJson.js」即可將xlsx轉成json。這部分也是用js寫的，借助node.js runtime。