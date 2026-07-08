# 共有レシピ管理の設定

このアプリを全端末共通のレシピデータで動かすには、Google Sheets と Apps Script を1つ用意します。
学習者側は追加ツール不要で、これまで通りアプリを開くだけです。

## 1. Googleスプレッドシートを作る

1. 新しいGoogleスプレッドシートを作成する
2. シート名を `recipes` にする
3. `recipes.csv` の中身をインポート、または貼り付ける

## 2. Apps Scriptを設定する

1. スプレッドシートの `拡張機能` から `Apps Script` を開く
2. `Code.gs` に、このフォルダの `Code.gs` の内容を貼り付ける
3. `デプロイ` から `新しいデプロイ` を選ぶ
4. 種類は `ウェブアプリ`
5. 実行ユーザーは `自分`
6. アクセスできるユーザーは `全員`
7. デプロイして、ウェブアプリURLをコピーする

## 3. アプリにURLを設定する

`recipe-api-config.js` の `window.RECIPE_API_URL` に、コピーしたウェブアプリURLを設定します。

```js
window.RECIPE_API_URL = "https://script.google.com/macros/s/....../exec";
```

このURLが空のとき、アプリはGitHub上の初期 `recipes.csv` を読みます。
URLを設定すると、通常はGoogle Sheets側の共有レシピを読み、読み込みに失敗した場合だけ初期 `recipes.csv` を読みます。

## 4. レシピを上書きする

アプリの `レシピ管理` でパスワード `kirameki` を入力し、編集済みCSVを選んで `全端末へ上書き反映` を押します。
成功するとGoogle Sheets側が更新され、以後すべての端末がそのレシピを読みます。
