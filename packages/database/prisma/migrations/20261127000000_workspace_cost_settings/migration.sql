BEGIN;

-- Existing reports keep their original costs and have an unknown order count.
ALTER TABLE "campaign_daily_fact"
    ADD COLUMN "orders" INTEGER,
    ADD CONSTRAINT "campaign_daily_fact_orders_check" CHECK ("orders" >= 0);

-- Each profile belongs to exactly one personal or organization workspace.
CREATE TABLE "workspace_cost_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT,
    "currency" VARCHAR(3) NOT NULL,
    "productCostBps" INTEGER NOT NULL,
    "paymentFeeBps" INTEGER NOT NULL,
    "fixedPaymentFeeMinor" BIGINT NOT NULL,
    "fulfillmentCostMinor" BIGINT NOT NULL,
    CONSTRAINT "workspace_cost_settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "workspace_cost_settings_workspace_check" CHECK (num_nonnulls("userId", "organizationId") = 1),
    CONSTRAINT "workspace_cost_settings_currency_check" CHECK ("currency" ~ '^[A-Z]{3}$'),
    CONSTRAINT "workspace_cost_settings_productCostBps_check" CHECK ("productCostBps" BETWEEN 0 AND 10000),
    CONSTRAINT "workspace_cost_settings_paymentFeeBps_check" CHECK ("paymentFeeBps" BETWEEN 0 AND 10000),
    CONSTRAINT "workspace_cost_settings_fixedPaymentFeeMinor_check" CHECK ("fixedPaymentFeeMinor" BETWEEN 0 AND 9007199254740991),
    CONSTRAINT "workspace_cost_settings_fulfillmentCostMinor_check" CHECK ("fulfillmentCostMinor" BETWEEN 0 AND 9007199254740991),
    CONSTRAINT "workspace_cost_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "workspace_cost_settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "workspace_cost_settings_userId_key" ON "workspace_cost_settings"("userId");
CREATE UNIQUE INDEX "workspace_cost_settings_organizationId_key" ON "workspace_cost_settings"("organizationId");

COMMIT;
