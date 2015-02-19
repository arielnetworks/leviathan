Leviathan [![Build Status](https://travis-ci.org/arielnetworks/leviathan.svg?branch=master)](https://travis-ci.org/arielnetworks/leviathan)
===================

たくさんの画面キャプチャをリビジョン間で比較し、報告を確認したり期待リビジョンを設定したりするサービス。


> **変数や用語の意味:**
>
>  - **expect**: 期待値。正常なリビジョンにとられたキャプチャ、またはそのリビジョンをさします。
>  - **チェック**: ユーザーがブラウザを通して、画像差異をバグ（リグレッションを起こした）なのか expect（開発者の意図的な仕様変更）なのかを判断することです。
>  - **rid**: リビジョンID。git や svn のリビジョン番号です。例）2
>  - **capture**: キャプチャID。リビジョン情報を除いたキャプチャのファイルパスから生成したハッシュです。例）db38f7f3f5d7d765f97e45d185066cc9


概要
-------------

このような運用を想定しています。

0. あるソフトウェアのコードベースがバージョン管理されていまとします
1. Jenkins などの CI が最新のリビジョンをビルド・テストします
2. 自動テストの過程で、複数のキャプチャを生成します（Leviathanからも見られます）
3. CI が Leviathan に対してビルド完了を通知します（その際、パラメータとして **rid** を与えます）
4. Leviathan が **rid** とキャプチャのパスをもとに、キャプチャが **expect** だった時との比較を一斉に行います
5. データベース内に結果を永続化します
6. ユーザーがブラウザで Leviathan にアクセスします
7. リビジョン・キャプチャごとに報告された差異を**チェック**します
8. **expect** と判断されたキャプチャは、次回以降の **expect** として登録・利用されます。

JSON API
-------------

詳細はtest/api.js を確認してください。

### POST /api/tidal-wave/{rid}

画像比較処理を実行します。Jenkins など CI からのキックを想定しています。それが最初の比較の場合、全キャプチャが expect（checkedAs=IS_OK）として登録されます。revisionAt でコミットのUNIX時間の指定が必要ですので注意してください。

### GET /api/revisions

tidal-waveを実行したリビジョンの一覧を返します。たいした情報はありません。

### GET /api/revisions/{rid}

特定リビジョンの情報です。以下の情報を含みます。

### GET /api/revisions/{rid}/captures

特定リビジョンのキャプチャ情報一覧です。

### GET /api/revisions/{rid}/captures/{cid}

特定リビジョンの特定キャプチャ情報です。

### GET /api/captures

リビジョンを無視した全キャプチャ情報一覧です。各キャプチャ情報に、expectリビジョンの情報を含みます。

### GET /api/captures/{cid}

まだありません。

環境
-------------
以下が予めインストールされている必要があります。

* Node.js
* MongoDB
* OpenCV

開発
-------------

Sass は 3.4 がインストールされている必要があります。

```
$ npm install
$ node run watchjs &  # ./ui/**/*.js 編集監視
$ node run watchsass &  # ./ui/sass/** 編集監視
$ node index.js -f CONFIG_FILE &  # サーバ起動
```

CONFIG_FILE のサンプルは leviathan.sample.json を確認して下さい。


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
