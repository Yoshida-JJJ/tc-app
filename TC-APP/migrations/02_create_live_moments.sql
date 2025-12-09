-- ==============================================================================
-- Migration: 02_create_live_moments
-- Description: "Live Moment Engine" (リアルタイム通知基盤) 用のスキーマ定義
-- Author: Database Architect (Antigravity)
-- ==============================================================================

-- 1. Enum定義: moment_type
-- 設計思想: Enumを使用し、イベントタイプのデータ整合性を保証します。
-- 内部値は標準的な小文字（または英大文字）とし、UI側で必要に応じてフォーマットします。
CREATE TYPE moment_type AS ENUM (
    'HOMERUN',
    'BIG_PLAY',
    'VICTORY',
    'RECORD_BREAK',
    'system_notice'
);

-- 2. テーブル定義: live_moments
-- 設計思想:
-- - `player_name` は外部キー制約を持たせず TEXT とし、柔軟性を持たせます（現時点でplayersテーブルと密結合させない）。
-- - `metadata` は JSONB を採用し、"Antigravity"（将来の未知の要件）に対応できる柔軟性を確保します。
-- - `intensity` は演出の強度を決定します (1=控えめ, 5=最大級のGlowing/派手な演出)。
CREATE TABLE live_moments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    player_name TEXT NOT NULL,
    type moment_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    intensity INTEGER CHECK (intensity BETWEEN 1 AND 5) DEFAULT 1,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. セキュリティ (RLS)
-- 設計思想:
-- 「熱狂（Heartbeat）」データは全ユーザー（認証/未認証問わず）が読み取れるべきです。
-- これら運命的なイベントを書き込めるのは、システム管理者（Service Role）のみとします。
ALTER TABLE live_moments ENABLE ROW LEVEL SECURITY;

-- 全ユーザー（Authenticated & Anon）に読み取り権限を付与
CREATE POLICY "Public Read Access"
ON live_moments FOR SELECT
USING (true);

-- 書き込み権限は Service Role のみに制限
-- (Supabaseのデフォルト動作として、明示的なPolicyがない限りユーザーによるINSERT/UPDATE/DELETEは拒否されます)

-- 4. Realtime (リアルタイム機能) の有効化
-- 設計思想: フロントエンドはこのテーブルの INSERT を監視し、即座にアニメーションを発火させます。
-- `supabase_realtime` パブリケーションにこのテーブルを追加します。
alter publication supabase_realtime add table live_moments;

-- 5. シードデータ (動作確認用)
-- 設計思想: Intensity 5 の視覚効果を即座にテストするための、伝説的な瞬間データ。
INSERT INTO live_moments (player_name, type, title, description, intensity, metadata)
VALUES (
    '大谷 翔平',
    'HOMERUN',
    '大谷翔平、劇的なサヨナラ満塁ホームラン！今季40号達成！',
    '9回裏、2アウト満塁。ドジャースタジアムが揺れた歴史的瞬間。',
    5,
    '{
        "inning": "9th Bottom",
        "opponent": "Rays",
        "video_url": "https://example.com/moment/ohtani-40.mp4",
        "related_card_ids": []
    }'::jsonb
);
