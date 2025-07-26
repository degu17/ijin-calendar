-- PostgreSQL初期化用SQL
-- データベース作成時に実行される

-- デフォルト設定
SET timezone = 'Asia/Tokyo';

-- 必要な拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- データベースの基本設定完了ログ
SELECT 'PostgreSQL database initialized successfully for ijincalendar' as status; 