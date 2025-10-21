# Fullstack Dockerfile: React Frontend + Python Backend
# Stage 1: Backend (Python)
FROM python:3.11 AS backend
WORKDIR /app
COPY backend_requirements.txt ./
RUN pip install --no-cache-dir -r backend_requirements.txt
COPY . .

# Stage 2: Frontend (Node)
FROM node:18 AS frontend
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Stage 3: Fullstack runtime
FROM node:18 AS fullstack
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
ENV REACT_APP_PORT=3000
ENV BACKEND_PORT=5000
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Expose ports (can be overridden with -p flag)
EXPOSE ${REACT_APP_PORT} ${BACKEND_PORT}

# Start both backend and frontend
CMD ["sh", "-c", "python3 flask_mock_backend.py & PORT=${REACT_APP_PORT} yarn start"]

# Usage:
# Build: docker build -t webscraper-fullstack .
# Run with default ports (3000, 5000):
#   docker run --rm -p 3001:3000 -p 5001:5000 webscraper-fullstack
# Run with custom ports:
#   docker run --rm -e REACT_APP_PORT=3000 -e BACKEND_PORT=5000 -p 3001:3000 -p 5001:5000 webscraper-fullstack
