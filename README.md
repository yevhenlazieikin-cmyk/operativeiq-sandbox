# operativeiq-sandbox

Angular 20 UI sandbox for OperativeIQ — powered by Claude Code, previewed live in Electron.

## Setup

```bash
git clone --recurse-submodules https://github.com/yevhenlazieikin-cmyk/operativeiq-sandbox.git
cd operativeiq-sandbox
npm install
npm start   # ng serve on :4200
```

## Submodule

`vendor/backoffice-shared-ui` tracks the `Staging` branch at `git.operativeiq.com`.

```bash
git submodule update --remote vendor/backoffice-shared-ui
git add vendor/backoffice-shared-ui
git commit -m "chore: bump shared-ui submodule"
```

## GitHub Pages

Pushing to `main` triggers `.github/workflows/deploy.yml` — builds with
`--base-href /operativeiq-sandbox/` and deploys to the `gh-pages` branch.

Live URL: `https://yevhenlazieikin-cmyk.github.io/operativeiq-sandbox/`
