FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Set build-time environment variables with defaults
ARG CAS_URL=https://login.iiit.ac.in/cas
ARG DATABASE_URL=postgres://root:mysecretpassword@localhost:5432/local
ARG ORIGIN=http://localhost:3000
ARG EMAIL_STRING=null
ARG VAPID_PUBLIC_KEY=null
ARG VAPID_PRIVATE_KEY=null

# Make them available to the build
ENV CAS_URL=$CAS_URL
ENV DATABASE_URL=$DATABASE_URL
ENV ORIGIN=$ORIGIN
ENV EMAIL_STRING=$EMAIL_STRING
ENV VAPID_PUBLIC_KEY=$VAPID_PUBLIC_KEY
ENV VAPID_PRIVATE_KEY=$VAPID_PRIVATE_KEY

# Build application
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --production --legacy-peer-deps && npm cache clean --force

# Copy built application
COPY --from=build /app/build ./build
COPY --from=build /app/static ./static
COPY --from=build /app/package.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "build"]