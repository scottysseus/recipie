# Recipie

Recipie is a recipe organizer with GenAI-powered import functionality. It allows you to easily import recipes from almost any website simply by providing a URL.

Recipie is built on [PocketBase](https://pocketbase.io/) with a [solidjs](https://www.solidjs.com/) and [Tailwind CSS](https://tailwindcss.com/) front end.

## Development Setup

Install the latest [golang](https://go.dev/doc/install) version.

Install [bun](https://bun.sh/):

```bash
npm install -g bun
```

and install all dependencies:

```bash
bun install
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

Which should be available at http://localhost:5173.

### App Setup

To properly use the application, a few integrations need to be configured that cannot be fully automated.

First, OIDC/OAuth2 integration with Google and Facebook can be configured through the admin UI. Follow [these instructions](https://pocketbase.io/docs/authentication/#oauth2-integration) in the admin UI, which can be accessed at http://localhost:8090/\_/. The client ID and secret can be viewed [here](https://console.cloud.google.com/apis/credentials/oauthclient/767578206397-g4ede95c4o8s10mqc8k74k82jffr4vlo.apps.googleusercontent.com?project=recipie-408600) for Google and [here](https://developers.facebook.com/apps/384003040967844/settings/basic/) for Facebook.

Next, install the `gcloud` CLI following [these instructions](https://cloud.google.com/sdk/docs/install). After installing, run the below command to authenticate your system:

```bash
gcloud auth application-default login
```
