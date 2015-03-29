リバイアサン [![Build Status](https://travis-ci.org/arielnetworks/leviathan.svg?branch=master)](https://travis-ci.org/arielnetworks/leviathan)
===================

スクリーンショットをリビジョン間で比較し、UIの変化を報告する開発支援ツールです。



使い方
-------------

あるGUIソフトウェアのコードベースがバージョン管理されているとして、以下ような使い方を想定しています。

1. CI が特定のリビジョンの E2E テストを開始します
2. E2E テストの過程でスクリーンショットを複数撮ります（画像はLeviathanから見える場所に蓄積します）
3. E2E テスト終了後、CI が Leviathan に対して画像解析を依頼します（その時リビジョンIDとリビジョンの日時が必要です）
4. Leviathan が 直前のリビジョンの画像と一斉に比較を行います
5. 結果を永続化します
6. ユーザーがブラウザで Leviathan にアクセスし、解析結果を確認します
   * UI仕様変更など、問題無いケースは「問題なし」という印をつけます
   * それ以外は「これはバグ」という印をつけ、バグ報告をするなどします
7. 過去に報告されたバグ・仕様変更を一覧することができます


利点
-------------
従来のSeleniumを使った値検査が保証できる範囲は限られていました。リバイアサンを使ったスクリーンショット比較では、これまで見つけにくかったUIのリグレッションに素早く気づくことができ、また画像に含まれる広い範囲のバグ検知を期待できます。



動作環境
-------------

* OpenCV
* Node.js
* MongoDB
* Sass >=3.4


開発
-------------

```
$ npm install
$ node run watch &  # Clientside JavaScript と Sass 編集監視
$ node index.js -f leviathan.sample.json &  # サーバ起動
```


テスト
-------------

```
$ npm test
```

製品向けにビルド
-------------

```
$ npm run build
```


JSON API
-------------

test/api.js を参考にしてください。
