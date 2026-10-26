# Run ComfyField in Docker

For a home server or a VPS. The image runs the production build on Node 22 with bundled ffmpeg. Models still run at your connected providers; the container needs no GPU.

## Start

From a clone of this repository:

```sh
docker compose up -d
```

Open http://localhost:5173 on the same machine, then add keys in **Connections**. Stop it with `docker compose down`; your data stays.

Without compose:

```sh
docker build -t comfyfield .
docker run -d --name comfyfield -p 127.0.0.1:5173:5173 -v comfyfield-data:/data/.comfyfield comfyfield
```

## Data

Keys, the Library, flows and media live in `/data/.comfyfield` inside the container. The compose file keeps them in the named volume `comfyfield-data`, so they survive rebuilds and updates. To use a folder on the host instead, replace the volume line with a bind mount, for example `./comfyfield-data:/data/.comfyfield`. The container runs as the `node` user (uid 1000), so that folder must be writable by uid 1000.

Back up the volume like any secret: it holds your provider keys.

## Keys from a file

Connections saves keys in the data volume. To pass keys as environment variables instead, uncomment `env_file: .env` in `docker-compose.yml` and fill `.env` from `.env.example`. The `.env` file is never copied into the image.

## Reach it from another machine

The container listens on all of its own interfaces, but the compose file publishes the port on the host's loopback only. Anyone who can reach the studio can use your saved keys and spend credits, so do not publish the port to the internet. From your laptop, use an SSH tunnel and open http://localhost:5173:

```sh
ssh -L 5173:localhost:5173 you@your-server
```

The local API accepts only same-origin requests whose Host is `localhost`, `127.0.0.1` or `[::1]`, so a reverse proxy on its own domain does not work yet. Use the tunnel.

## Update

```sh
git pull
docker compose up -d --build
```
