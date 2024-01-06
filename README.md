# Recipie

Recipie is a recipe organizer with GenAI-powered import functionality. It allows you to easily import recipes from almost any website simply by providing a URL.

Recipie is built on [PocketBase](https://pocketbase.io/) with a [solidjs](https://www.solidjs.com/) and [Tailwind CSS](https://tailwindcss.com/) front end.

## Development Setup

Install the latest [golang](https://go.dev/doc/install) version.

Install [bun](https://bun.sh/):

```bash
npm install -g bun
```

Start the backend server:

```bash
bun run build:server
bun run server
```

In a separate terminal, start the client dev server:

```bash
bun run dev:client
```

Which should be available at `http://localhost:5173`.
