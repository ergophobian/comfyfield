# ComfyField in a container, for a home server or a VPS.
# Build: docker build -t comfyfield .   Run: docker compose up -d

FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npx vite build

FROM node:22-slim
ENV NODE_ENV=production \
    COMFYFIELD_HOME=/data \
    COMFYFIELD_HOST=0.0.0.0
WORKDIR /app
COPY package.json package-lock.json ./
# Install scripts stay on so ffmpeg-static downloads its Linux binary; the check fails the build without it.
RUN npm ci --omit=dev --no-audit --no-fund \
 && node -e "const f=require('ffmpeg-static');require('child_process').execFileSync(f,['-version'],{stdio:'ignore'});console.log('ffmpeg ok:',f)" \
 && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY . .
RUN mkdir -p /data/.comfyfield && chown -R node:node /data
USER node
VOLUME /data/.comfyfield
EXPOSE 5173
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD node -e "fetch('http://127.0.0.1:5173/').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "bin/comfyfield.js", "start", "--port", "5173", "--no-open"]
