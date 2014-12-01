Leviathan
===================

たくさんの画面キャプチャをリビジョン間で比較し、ブラウザで確認・チェックするサービス。


> **用語や変数の意味:**
> 
>  - **expect**: 期待値。正常なリビジョンにとられたキャプチャ、またはそのリビジョンをさします。
>  - **チェック**: ユーザーがブラウザを通して、画像差異をバグ（リグレッションを起こした）なのか expect（開発者の意図的な仕様変更）なのかを判断することです。
>  - **rid**: リビジョンID。git や svn のリビジョン番号です。
>  - **cid**: キャプチャID。リビジョン情報を除いたキャプチャのファイルパスから生成したハッシュです。


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

以下概要を説明します。詳細はtest/json-api.js を確認してください。
 
### /api/tidal-wave/{rid}

画像比較を実行します。Jenkins など CI からのキックを想定しています。それが最初の比較の場合、全キャプチャが expect として登録されます。

### /api/revisions

tidal-wave が報告した生データと、ユーザーがキャプチャをチェックした結果を返します。

### /api/revisions/{rid}
### /api/revisions/{rid}/captures
### /api/revisions/{rid}/captures/{cid}
### /api/captures

キャプチャ情報と、そのexpectリビジョンを返します。

### /api/captures/{cid}
