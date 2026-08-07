# Fullstack Dockerfile: React Frontend + Python Backend
#
# ⚠️  READ THIS BEFORE USING: the CMD at the bottom starts
# `flask_mock_backend.py`, which returns FABRICATED article data, not real
# scraped results. This image is a UI demo harness, NOT a deployable
# production stack. The real backend is the Django API in the sibling
# `Webscraping` repo -- see docker-compose.yml, which wires that up properly
# alongside Postgres/Redis/Elasticsearch. Do not present output from this
# image as real scraping.

# Stage 1: Backend (Python)
FROM python:3.13 AS backend
WORKDIR /app
COPY backend_requirements.txt ./
RUN pip install --no-cache-dir -r backend_requirements.txt
COPY . .

# Stage 2: Frontend (Node) -- node:18 is EOL, 22 is the active LTS line
FROM node:22 AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
# --legacy-peer-deps: react-wordcloud@1.2.7 declares a React 16 peer dep
# while this app runs React 18.
RUN npm ci --legacy-peer-deps
COPY . .

# Stage 3: Fullstack runtime
FROM node:22 AS fullstack
WORKDIR /app

# Install Python in the Node image for fullstack support
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python packages
COPY backend_requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r backend_requirements.txt

# Copy backend and frontend from previous stages
COPY --from=backend /app /app
COPY --from=frontend /app/node_modules /app/node_modules

# Environment variables for configurable ports
ENV FRONTEND_PORT=3000
ENV BACKEND_PORT=5000

# Expose ports (can be overridden with -p flag)
EXPOSE ${FRONTEND_PORT} ${BACKEND_PORT}

# Start both backend and frontend. --host binds 0.0.0.0 so the Vite dev
# server is reachable from outside the container.
CMD ["sh", "-c", "python3 flask_mock_backend.py & npm start -- --host 0.0.0.0 --port ${FRONTEND_PORT}"]

# Usage:
# Build: docker build -t webscraper-fullstack .
# Run with default ports (3000, 5000):
#   docker run --rm -p 3001:3000 -p 5001:5000 webscraper-fullstack
# Run with custom ports:
#   docker run --rm -e FRONTEND_PORT=3000 -e BACKEND_PORT=5000 -p 3001:3000 -p 5001:5000 webscraper-fullstack
