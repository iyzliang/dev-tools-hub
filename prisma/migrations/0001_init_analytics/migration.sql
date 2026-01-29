-- CreateTable
CREATE TABLE "analytics_events" (
    "id" UUID NOT NULL,
    "anonymous_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "tool_name" TEXT,
    "properties" JSONB,
    "user_agent" TEXT,
    "locale" TEXT,
    "timezone" TEXT,
    "soft_fingerprint" TEXT,
    "ip_hash" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_usage_daily" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "tool_name" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_usage_daily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_events_created_at" ON "analytics_events"("created_at");

-- CreateIndex
CREATE INDEX "idx_events_tool_name_created_at" ON "analytics_events"("tool_name", "created_at");

-- CreateIndex
CREATE INDEX "idx_events_anonymous_id_created_at" ON "analytics_events"("anonymous_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_tool_usage_daily_date_tool_event" ON "tool_usage_daily"("date", "tool_name", "event_name");

