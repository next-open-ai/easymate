FROM node:22-bookworm-slim AS runtime

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-venv ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    EASYMATE_DATA_DIR=/opt/easymate-data \
    EASYMATE_API_HOST=0.0.0.0 \
    EASYMATE_API_PORT=49832 \
    EASYMATE_AGENT_ENGINE=agentscope

WORKDIR /opt/easymate

COPY package.docker.json ./package.json
COPY README.md README-EN.md ./
COPY bin ./bin
COPY scripts/lib ./scripts/lib
COPY apps/api/dist ./apps/api/dist
COPY apps/renderer/dist ./apps/renderer/dist
COPY runtimes/python-runtime ./runtimes/python-runtime

RUN npm install --omit=dev --no-audit --no-fund
RUN chmod +x bin/easymate.mjs
RUN mkdir -p /opt/easymate-data && EASYMATE_DATA_DIR=/opt/easymate-data node bin/easymate.mjs init

EXPOSE 49832
VOLUME ["/opt/easymate-data"]

CMD ["node", "bin/easymate.mjs", "start"]
