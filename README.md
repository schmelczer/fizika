# Fizika

Practice web app for the Hungarian **emelt szintű fizika** (advanced-level
physics) written school-leaving exam. Students generate quizzes from a bank of
past exam questions — by topic, by exam paper, or as a random "érettségi"
set — answer them, and review their past results (stored locally in the
browser).

Live at <https://fizika.schmelczer.dev>.

## Architecture

```
frontend/  Static site (HTML + CSS + jQuery, no build step).
           Deployed to Pages. Fetches questions from the backend API.

backend/   Express server. Serves the admin panel and a small REST API for
           editing questions and images. Reads/writes a single JSON file plus
           an images directory.
```

The **backend is the single source of truth** for question data. The frontend
always fetches it from `GET /api/fizika` (see `frontend/js/load.js`); the
question JSON is no longer shipped with the static site.

### Access control

Authentication is handled at the reverse proxy (nginx + basic auth), not in the
app. The proxy exposes only two endpoints publicly; everything else (the admin
panel and all `/api/admin/*` routes) requires a login:

| Path            | Access  | Purpose                          |
| --------------- | ------- | -------------------------------- |
| `/api/fizika`   | public  | question data for the public app |
| `/api/pics/*`   | public  | question images                  |
| everything else | private | admin panel + edit API           |

The app trusts the proxy, so **do not expose the backend port directly** without
adding authentication in front of it.

## API

| Method   | Route                         | Description           |
| -------- | ----------------------------- | --------------------- |
| `GET`    | `/api/fizika`                 | All questions         |
| `GET`    | `/api/images`                 | List image filenames  |
| `GET`    | `/api/pics/:file`             | Serve an image        |
| `GET`    | `/api/admin/questions`        | All questions (admin) |
| `POST`   | `/api/admin/questions`        | Create a question     |
| `PUT`    | `/api/admin/questions/:id`    | Update a question     |
| `DELETE` | `/api/admin/questions/:id`    | Delete a question     |
| `POST`   | `/api/admin/images/upload`    | Upload an image       |
| `DELETE` | `/api/admin/images/:filename` | Delete an image       |

## Configuration

The backend is configured via environment variables:

| Variable       | Default                   | Description                       |
| -------------- | ------------------------- | --------------------------------- |
| `PORT`         | `3001`                    | Port to listen on                 |
| `DATA_PATH`    | `../frontend/fizika.json` | Path to the questions JSON file   |
| `PICS_PATH`    | `../frontend/pics`        | Directory holding question images |
| `FRONTEND_URL` | `*`                       | Allowed CORS origin               |

In production `DATA_PATH` and `PICS_PATH` point at mounted volumes that hold the
canonical data. The defaults are dev conveniences only — set both explicitly to
a JSON file and a directory that exist before starting.

## Development

```sh
cd backend
npm install
DATA_PATH=/path/to/fizika.json PICS_PATH=/path/to/pics npm run dev
```

Then open `frontend/index.html` (or serve `frontend/` statically). On
`localhost` the frontend talks to the backend on port 3001 automatically.

## Tests

Backend tests use Node's built-in test runner (no extra dependencies):

```sh
cd backend
npm test
```

## Formatting

[Prettier](https://prettier.io) formats the whole repo. Run from the repo root:

```sh
npm install        # once, to install Prettier
npm run format       # write
npm run format:check # verify (also run in CI)
```

## CI / Deployment

Forgejo Actions workflows in `.forgejo/workflows/`:

- `test.yml` — formatting check + backend tests on every push/PR.
- `docker-publish.yml` — builds and publishes the backend image from `backend/`.
- `deploy.yml` — deploys `frontend/` to Pages.
