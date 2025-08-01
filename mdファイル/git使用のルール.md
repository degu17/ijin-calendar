# Git利用のルールとコミット戦略

## 1. はじめに

このドキュメントは、「偉人日めくりカレンダー」プロジェクトにおけるGitの利用ルールを定めたものです。
全員が同じルールに従うことで、コードの品質を保ち、開発プロセスをスムーズかつ確実なものにすることを目的とします。

**基本方針:**
-   **フィーチャーブランチ:** 機能開発や修正は必ず専用のブランチで行います。
-   **こまめなコミット:** タスクを小さな単位に分割し、一つの単位が終わるごとにコミットします。
-   **わかりやすいコミットメッセージ:** 後から誰が見ても変更内容がわかるように、規約に沿ったメッセージを記述します。
-   **プルリクエストベースでのマージ:** `main`ブランチへの直接のプッシュは禁止し、必ずプルリクエスト（PR）を作成してマージします。

---

## 2. ブランチ戦略

### `main`ブランチ
-   **役割:** 常に安定し、デプロイ可能な状態を保つ本番用ブランチ。
-   **ルール:**
    -   直接のコミットやプッシュは**厳禁**です。
    -   `develop`ブランチから、安定したバージョンがリリースされるタイミングでのみマージされます。

### `develop`ブランチ
-   **役割:** 開発のベースとなるブランチ。完了したフィーチャーブランチはここにマージされます。
-   **ルール:**
    -   直接のコミットは原則行わず、フィーチャーブランチからのマージによって更新されます。

### フィーチャーブランチ (`feature/...`)
-   **役割:** 新機能の開発やバグ修正など、個別のタスクを行うためのブランチ。
-   **命名規則:** `feature/タスク内容` の形式で命名します。
    -   例: `feature/auth-system`
    -   例: `feature/calendar-ui`
    -   例: `fix/login-bug`
-   **ルール:**
    -   必ず`develop`ブランチから作成します。
    -   作業が完了したら`develop`ブランチに対してプルリクエストを作成します。

---

## 3. コミットの粒度とタイミング

**「1コミット = 1つの意味のある作業単位」**を徹底します。これにより、変更の追跡や問題発生時の切り分けが容易になります。コミットのタイミングは、`TODO.md`のタスクをさらに細分化した単位を意識します。

### コミットタイミングの具体例

`TODO.md`の「**認証システムの実装 (NextAuth.js)**」というタスクを例に考えてみましょう。このタスクを一つの巨大なコミットで行うのではなく、以下のように分割してコミットします。

1.  `feat(auth): NextAuth.jsとPrismaAdapterの基本設定を追加`
    -   関連パッケージをインストール。
    -   `lib/auth.ts`と`api/auth/[...nextauth]/route.ts`を作成し、骨格を実装。
    -   Prismaスキーマに`Account`, `Session`モデルなどを追加し、`migrate`を実行。
    -   **→ ここまでで一つの区切り。まずは認証基盤ができた状態でコミット。**

2.  `feat(auth): Email/Passwordによる認証機能を実装`
    -   `CredentialsProvider`を設定。
    -   ログイン・新規登録フォームのUIコンポーネントを作成。
    -   パスワードのハッシュ化ロジックを実装。
    -   **→ メール/パスワードでのログイン・ログアウトが一通り動作する状態でコミット。**

3.  `feat(auth): Google OAuth認証機能を実装`
    -   `GoogleProvider`を設定。
    -   GoogleログインボタンをUIに追加。
    -   **→ Googleログインが一通り動作する状態でコミット。**

4.  `feat(auth): 認証ミドルウェアを導入しダッシュボードを保護`
    -   `middleware.ts`を作成し、`matcher`を設定。
    -   **→ ページのアクセス制御が機能した状態でコミット。**

このように、**「中途半端な状態」ではなく「小さな機能が一つ完成し、アプリケーションが正常に動作する状態」**でコミットすることが理想です。

---

## 4. コミットメッセージのルール

コミット履歴を明確に保つため、[**Conventional Commits**](https://www.conventionalcommits.org/ja/v1.0.0/)という規約に従います。

**フォーマット:**
```
<type>(<scope>): <subject>
```

-   **type:** コミットの種類を表す（下記参照）。
-   **scope (任意):** コミットが影響する範囲（例: `auth`, `ui`, `db`）。
-   **subject:** 変更内容を簡潔に説明する要約。

### 主な`<type>`

| type     | 説明                                                              |
| :------- | :---------------------------------------------------------------- |
| **feat** | **新機能**の追加                                                  |
| **fix**  | **バグ修正**                                                      |
| **docs** | ドキュメントの変更のみ（README, `*.md`など）                      |
| style    | コードの動作に影響しない変更（フォーマット、セミコロンなど）      |
| refactor | バグ修正や機能追加ではないコードの変更（リファクタリング）        |
| test     | テストの追加・修正                                                |
| chore    | ビルドプロセスや補助ツール、ライブラリの変更（`package.json`など） |

### メッセージの具体例

-   `feat(auth): Google OAuth認証機能を実装`
-   `fix(ui): ログインボタンが中央に表示されない問題を修正`
-   `docs: Git利用のルールを策定`
-   `chore: ESLintのルールを追加`
-   `refactor(db): ユーザー取得ロジックをuser-serviceに切り出し`

---

## 5. プルリクエスト (PR) のフロー

1.  **フィーチャーブランチをPush:** ローカルでの作業が完了したら、リモートリポジトリ（GitHub）にフィーチャーブランチをプッシュします。
2.  **プルリクエストの作成:** GitHub上で、`自分のフィーチャーブランチ` → `develop`ブランチへのプルリクエストを作成します。
3.  **内容の説明:** PRのタイトルと説明を記述します。
    -   **何を**変更したのか。
    -   **なぜ**その変更が必要なのか。
    -   関連する`TODO`や`Issue`があればリンクを貼ります。
4.  **セルフレビュー:** マージする前に、自分自身で変更内容に問題がないか最終確認を行います。
5.  **マージ:** 確認後、PRを`develop`ブランチにマージします。
6.  **ブランチの削除:** マージが完了したフィーチャーブランチは、リポジトリを綺麗に保つために削除します。 