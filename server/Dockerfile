FROM node:20-alpine

WORKDIR /app

# Copy prisma schema from root
COPY prisma ./prisma
COPY server ./server

WORKDIR /app/server
RUN npm install

# Generate prisma client using the schema from ../prisma
RUN npm run prisma:generate

EXPOSE 3001
CMD ["npm", "start"]
