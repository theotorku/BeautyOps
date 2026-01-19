-- integration_logs: Tracks every outbound event for audit and debugging
CREATE TABLE IF NOT EXISTS integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL, -- BeautyOps internal event ID
    event_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'skipped')),
    payload JSONB,
    response_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ghl_id_map: Maps BeautyOps entities to GHL entities (Idempotency)
CREATE TABLE IF NOT EXISTS ghl_id_map (
    bo_entity_type TEXT NOT NULL, -- e.g., 'user', 'pilot', 'store'
    bo_entity_id UUID NOT NULL,
    ghl_entity_id TEXT NOT NULL, -- GHL IDs are strings
    ghl_location_id TEXT NOT NULL, -- Sub-Account ID
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (bo_entity_type, bo_entity_id)
);

-- Index for fast lookups during sync
CREATE INDEX IF NOT EXISTS idx_ghl_map_lookup ON ghl_id_map(bo_entity_type, bo_entity_id);
