# IntervestMfe

## Running the project

Clone the repo, cd into the project and install the dependencies

```bash
pnpm install
```

Run the project

```bash
npx nx serve host
```

View the project in the browser at http://localhost:4200

## CLI commands used to create the project

This command creates the workspace

```bash
npx create-nx-workspace@latest intervest-mfe --preset=apps
```

This command creates the host application and the remotes.

```bash
npx nx g @nx/react:host \
  --directory=apps/host \
  --name=host \
  --remotes=workflows,analytics,settings,reports \
  --style=css \
  --e2eTestRunner=none \
  --no-interactive
```

This command creates libraries like auth-utils, shared-ui and shared-types.

```bash
npx nx g @nx/react:library \
  --directory=libs/auth-utils \
  --name=auth-utils \
  --bundler=none \
  --no-interactive
```

View the dependency graph

```bash
npx nx graph
```

Architecture overview can be found in the [architecture.md](docs/architecture.md) file.
