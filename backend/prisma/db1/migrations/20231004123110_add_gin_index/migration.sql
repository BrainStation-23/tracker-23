-- This is an empty migration.

CREATE INDEX title_gin_index ON "Task" USING gin(to_tsvector('english', title));
