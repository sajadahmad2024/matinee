-- ════════════════════════════════════════════════════════════════════════════
-- Content publish/availability regions (admin "Publish to regions" multi-select).
-- A content item is available in a macro-region if a row exists here; "global" =
-- one row per region. Distinct from contents.rights_region (single licensing focus)
-- and from geo_policies (country-level platform gating). UUIDv7 not needed (composite PK).
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS content_regions (
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    region     VARCHAR(10) NOT NULL CHECK (region IN ('NA','EU','APAC','LATAM','MEA')),
    PRIMARY KEY (content_id, region)
);
CREATE INDEX idx_content_regions_region ON content_regions(region);
