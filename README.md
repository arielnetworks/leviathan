Leviathan [![Build Status](https://travis-ci.org/arielnetworks/leviathan.svg?branch=master)](https://travis-ci.org/arielnetworks/leviathan)
===================

スクリーンショットをリビジョン間で比較し、変化を報告するサービスです。



概要
-------------

あるGUIソフトウェアのコードベースがバージョン管理されているとして、以下ような運用を想定しています。

1. CI が特定のリビジョンの E2E テストを開始します
2. E2E テストの過程でスクリーンショットを複数撮ります（画像はLeviathanから見える場所に蓄積します）
3. E2E テスト終了後、CI が Leviathan に対して画像解析を依頼します（その時リビジョンIDとリビジョンの日時が必要です）
4. Leviathan が 直前のリビジョンの画像と一斉に比較を行います
5. 結果を永続化します
6. ユーザーがブラウザで Leviathan にアクセスし、解析結果を確認します
   * UI仕様変更など、問題無いケースは `IS_OK` という印をつけます
   * それ以外は `IS_BUG` という印をつけ、バグ報告をするなどします。

 

JSON API
-------------

test/api.js を参考にしてください。


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
