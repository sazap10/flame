# Flame

![Homescreen screenshot](.github/home.png)

## Description

Flame is self-hosted startpage for your server. Its design is inspired (heavily) by [SUI](https://github.com/jeroenpardon/sui). Flame is very easy to setup and use. With built-in editors, it allows you to setup your very own application hub in no time - no file editing necessary.

## Functionality
- 📝 Create, update, delete your applications and bookmarks directly from the app using built-in GUI editors
- 📌 Pin your favourite items to the homescreen for quick and easy access
- 🔍 Integrated search bar with local filtering, 11 web search providers and ability to add your own
- 🔑 Authentication system to protect your settings, apps and bookmarks
- 🔨 Dozens of options to customize Flame interface to your needs, including support for custom CSS, 15 built-in color themes and custom theme builder
- ☀️ Weather widget with current temperature, cloud coverage and animated weather status
- 🐳 Docker integration to automatically pick and add apps based on their labels

## Installation

### With Docker (recommended)

The image is published to the GitHub Container Registry by the included CI
workflow (`.github/workflows/build-image.yml`), which pushes to
`ghcr.io/<owner>/<repo>`. Replace `<owner>/<repo>` below with your GitHub
repository (e.g. the exact path shown in the workflow run's summary).

```sh
docker pull ghcr.io/<owner>/<repo>
```

#### Deployment

```sh
# run container
docker run -p 5005:5005 -v /path/to/data:/app/data -e PASSWORD=change_me ghcr.io/<owner>/<repo>
```

#### Building images

```sh
# build image for amd64 only
docker build -t flame -f .docker/Dockerfile .

# build multiarch image for amd64, armv7 and arm64
# building failed multiple times with 2GB memory usage limit so you might want to increase it
docker buildx build \
  --platform linux/arm/v7,linux/arm64,linux/amd64 \
  -f .docker/Dockerfile.multiarch \
  -t flame:multiarch .
```

#### Docker-Compose

```yaml
version: '3.6'

services:
  flame:
    image: ghcr.io/<owner>/<repo>:latest
    container_name: flame
    volumes:
      - /path/to/host/data:/app/data
      - /var/run/docker.sock:/var/run/docker.sock # optional but required for Docker integration
    ports:
      - 5005:5005
    secrets:
      - password # optional but required for (1)
    environment:
      - PASSWORD=change_me
      - PASSWORD_FILE=/run/secrets/password # optional but required for (1)
    restart: unless-stopped

# optional but required for Docker secrets (1)
secrets:
  password:
    file: /path/to/secrets/password
```

##### Docker Secrets

All environment variables can be overwritten by appending `_FILE` to the variable value. For example, you can use `PASSWORD_FILE` to pass through a docker secret instead of `PASSWORD`. If both `PASSWORD` and `PASSWORD_FILE` are set, the docker secret will take precedent.

```bash
# ./secrets/flame_password
my_custom_secret_password_123

# ./docker-compose.yml
secrets:
  password:
    file: ./secrets/flame_password
```

#### Skaffold

```sh
# use skaffold
skaffold dev
```

### Without Docker

Follow instructions from wiki: [Installation without Docker](https://github.com/pawelmalak/flame/wiki/Installation-without-docker)

## Development

### Technology

- Backend
  - Node.js + Express
  - Sequelize ORM + SQLite
- Frontend
  - React
  - Redux
  - TypeScript
- Deployment
  - Docker
  - Kubernetes

### Creating dev environment

```sh
# clone repository
git clone https://github.com/pawelmalak/flame
cd flame

# run only once
npm run dev-init

# start backend and frontend development servers
npm run dev
```

## Screenshots

![Apps screenshot](.github/apps.png)

![Bookmarks screenshot](.github/bookmarks.png)

![Settings screenshot](.github/settings.png)

![Themes screenshot](.github/themes.png)

## Usage

### Authentication

Visit [project wiki](https://github.com/pawelmalak/flame/wiki/Authentication) to read more about authentication

#### Anonymous access

Set the `ANONYMOUS_AUTH=true` environment variable to disable the login wall. Every visitor is then treated as authenticated with full view and edit access, and the password login form is hidden. This is intended for instances that sit behind a trusted reverse proxy, SSO, or a private network where access is already controlled. Leave it unset (the default) to keep the normal password-based login.

```yaml
services:
  flame:
    image: ghcr.io/<owner>/<repo>:latest # image built by .github/workflows/build-image.yml
    environment:
      - ANONYMOUS_AUTH=true
```

### Search bar

#### Searching

The default search setting is to search through all your apps and bookmarks. If you want to search using specific search engine, you need to type your search query with selected prefix. For example, to search for "what is docker" using google search you would type: `/g what is docker`.

For list of supported search engines, shortcuts and more about searching functionality visit [project wiki](https://github.com/pawelmalak/flame/wiki/Search-bar).

### Setting up weather module

1. Obtain API Key from [Weather API](https://www.weatherapi.com/pricing.aspx).
   > Free plan allows for 1M calls per month. Flame is making less then 3K API calls per month.
2. Get lat/long for your location. You can get them from [latlong.net](https://www.latlong.net/convert-address-to-lat-long.html).
3. Enter and save data. Weather widget will now update and should be visible on Home page.

### Docker integration

In order to use the Docker integration, each container must have the following labels:

```yml
labels:
  - flame.type=application # "app" works too
  - flame.name=My container
  - flame.url=https://example.com
  - flame.icon=icon-name # optional, default is "docker"
  - flame.icon.light=icon-name # optional, icon used when the light theme is active
  - flame.icon.dark=icon-name # optional, icon used when the dark theme is active
  - flame.category=Media # optional, the category to group this under
# flame.icon accepts a Material Design icon name, an image/SVG URL, a selfh.st
# icon shorthand (e.g. flame.icon=selfhst:bitwarden), a GitHub icon-repo
# shorthand for any repo using the selfh.st folder layout (e.g.
# flame.icon=gh:owner/repo/myicon), or the filename of an icon you've uploaded in
# the UI (e.g. flame.icon=myservice.png). Both shorthands accept an optional
# /png|/webp format and/or /auto to pick the -light/-dark variant per theme
```

> `flame.icon.light` / `flame.icon.dark` let you supply theme-specific icons. When the active scheme has no matching icon, Flame falls back to `flame.icon`. They accept the same values as `flame.icon` (Material Design icon name, URL, `selfhst:`/`gh:` shorthand, or uploaded file).

> "Use Docker API" option must be enabled for this to work. You can find it in Settings > Docker

> **Note (this fork):** discovered containers are created as **categorised bookmarks**, not flat apps. `flame.category` chooses the category; containers without it fall back to the `DOCKER_DEFAULT_CATEGORY` environment variable (default `Apps`). Categories are created automatically, and any app previously auto-created for the same service is removed so it isn't listed twice.

#### tsdproxy auto-discovery

If your containers are exposed through [tsdproxy](https://github.com/almeidapaulopt/tsdproxy), Flame can discover them automatically without any `flame.*` labels. Set the `TSDPROXY_DOMAIN` environment variable to your tailnet/proxy domain, and any container with `tsdproxy.enable: "true"` and a `tsdproxy.name` is added as an app at `https://<tsdproxy.name>.<TSDPROXY_DOMAIN>`.

```yaml
# Flame container
environment:
  - TSDPROXY_DOMAIN=example.ts.net

# A discovered service needs nothing extra — its existing tsdproxy labels are enough:
labels:
  tsdproxy.enable: "true"
  tsdproxy.name: "myservice" # -> https://myservice.example.ts.net
  # flame.category: Media    # optional, group it under a category
  # flame.icon: myservice    # optional nicer icon
  # flame.type: skip         # optional: opt this container out of Flame
```

Any explicit `flame.*` label still wins, so you can override the derived name, URL, icon, or category, or opt a container out by setting `flame.type` to anything that isn't `app`. Leaving `TSDPROXY_DOMAIN` unset disables tsdproxy discovery entirely.

You can also set up different apps in the same label adding `;` between each one.

```yml
labels:
  - flame.type=application
  - flame.name=First App;Second App
  - flame.url=https://example1.com;https://example2.com
  - flame.icon=icon-name1;icon-name2
  - flame.icon.light=light-icon1;light-icon2 # optional, per-app light-theme icons
  - flame.icon.dark=dark-icon1;dark-icon2 # optional, per-app dark-theme icons
```

If you want to use a remote docker host follow this instructions in the host:

- Open the file `/lib/systemd/system/docker.service`, search for `ExecStart` and edit the value

```text
ExecStart=/usr/bin/dockerd -H tcp://0.0.0.0:${PORT} -H unix:///var/run/docker.sock
```

>The above command will bind the docker engine server to the Unix socket as well as TCP port of your choice. “0.0.0.0” means docker-engine accepts connections from all IP addresses.

- Restart the daemon and Docker service

```shell
sudo systemctl daemon-reload
sudo service docker restart
```

- Test if it is working

```shell
curl http://${IP}:${PORT}/version
```

#### Connecting through `DOCKER_HOST`

Set the `DOCKER_HOST` environment variable to point Flame at a Docker API endpoint, e.g. a [docker-socket-proxy](https://github.com/Tecnativa/docker-socket-proxy) instead of the raw socket:

```yml
environment:
  - DOCKER_HOST=tcp://flame-socket-proxy:2375 # tcp:// and http:// are accepted
```

When set, it overrides the "Docker host" setting for both discovery and container control. When unset, the setting is used as before (`localhost` uses `/var/run/docker.sock`, anything else is reached over http). Other schemes (`unix://`, `https://`, `ssh://`) are not supported.

Discovery lists containers with `all=1`, so apps for stopped containers stay on the page.

#### Start/stop containers from Flame (opt-in)

Flame can show a container's state and offer a start/stop button on its app tile. It is off unless you enable it **and** label each container you want controllable:

```yml
# Flame container
environment:
  - DOCKER_CONTROL=true
  - DOCKER_HOST=tcp://flame-socket-proxy:2375 # optional

# A container Flame may start/stop
labels:
  - flame.name=Jellyfin
  - flame.url=https://jellyfin.example.com
  - flame.control=true # must be exactly "true"
```

- `DOCKER_CONTROL=true` enables the feature. Unset or any other value: no buttons, and the control endpoints (`GET /api/apps/containers`, `POST /api/apps/:id/start|stop`) return 404.
- Only containers carrying `flame.control=true` are controllable. The label is re-checked against the live container on every start/stop request, so removing the label revokes control immediately.
- Buttons are shown to authenticated users (and to everyone when `ANONYMOUS_AUTH=true`). The tile shows a state dot and a start or stop button; a stopped container's tile is dimmed but still links to the app. State refreshes every 15 seconds while the page is visible.

##### Docker API calls Flame makes

If you front the Docker socket with a proxy, these are the only requests Flame sends (unversioned paths; `<name>` matches `[a-zA-Z0-9_.-]+`). Allowlist exactly these:

| Method | Path | Used for |
| ------ | ---- | -------- |
| `GET`  | `/containers/json` (e.g. `?all=1`) | discovery, state of all controllable apps |
| `GET`  | `/containers/<name>/json` | label re-check and post-action state |
| `POST` | `/containers/<name>/start` | start |
| `POST` | `/containers/<name>/stop` | stop |

Without `DOCKER_CONTROL=true` only the first one is used.

> **Security:** anyone who can reach Flame with an authenticated session can start and stop every container labelled `flame.control=true`. With `ANONYMOUS_AUTH=true` that means **everyone who can reach Flame**. Only enable this behind a trusted network or reverse proxy, label only containers you are happy to expose, and prefer a socket proxy that allows just the four requests above over mounting the raw Docker socket.

### Kubernetes integration

In order to use the Kubernetes integration, each ingress must have the following annotations:

```yml
metadata:
  annotations:
  - flame.pawelmalak/type=application # "app" works too
  - flame.pawelmalak/name=My container
  - flame.pawelmalak/url=https://example.com
  - flame.pawelmalak/icon=icon-name # optional, default is "kubernetes"
```

> "Use Kubernetes Ingress API" option must be enabled for this to work. You can find it in Settings > Docker

### Import HTML Bookmarks (Experimental)

- Requirements
  - python3
  - pip packages: Pillow, beautifulsoup4
- Backup your `db.sqlite` before running script!
- Known Issues:
  - generated icons are sometimes incorrect

```bash
pip3 install Pillow, beautifulsoup4

cd flame/.dev
python3 bookmarks_importer.py --bookmarks <path to bookmarks.html> --data <path to flame data folder>
```

### Custom CSS and themes

See project wiki for [Custom CSS](https://github.com/pawelmalak/flame/wiki/Custom-CSS) and [Custom theme with CSS](https://github.com/pawelmalak/flame/wiki/Custom-theme-with-CSS).
