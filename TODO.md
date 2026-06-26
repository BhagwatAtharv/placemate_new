# Proctoring (Placemate) — Implementation Tracker

## Backend (Node/Express) — Planned Steps
- [x] Update MySQL schema: add proctoring tables (candidate, assessment, proctoring_session, violation, warning).
- [x] Verify migration loads schema.sql correctly (and that SQL executes cleanly).



- [ ] Verify/adjust migration logic to load updated schema.sql.
- [x] Wire `proctoringRoutes` into server app.

- [x] Add backend module: routes/controllers/models/services for proctoring.

- [x] Implement REST APIs (start/end session, log violation, fetch violations, fetch report).

  - [x] Start proctoring session

  - [x] End session

  - [x] Log violation event

  - [x] Get candidate violations timeline

  - [x] Get candidate proctoring report (risk score + recommendations)

- [x] Wire `proctoringRoutes` into server app.

- [ ] Add configuration for warning thresholds and risk scoring.
- [ ] Update README with API docs + setup.

## Frontend (React) — Planned Steps (after backend is ready)
- [ ] Implement candidate proctoring page with webcam/mic/screen-share hooks.
- [ ] Implement detection pipelines (TF.js/landmarks/COCO-SSD) and event-to-violation mapping.
- [ ] Implement warnings UI + auto-submit threshold handling.
- [ ] Implement admin dashboard: live monitoring + charts.
- [ ] Optimize runtime (throttling, sampling, reuse models/tensors).

