# Base image off of Node 22
FROM node:22-bullseye-slim AS base

WORKDIR /test_ui

RUN echo "echo 'git is not installed'" > /usr/bin/git
RUN chmod +x /usr/bin/git

# Install create-next-app globally
RUN npm install -g create-next-app

CMD yes | npx create-next-app@latest test_ui && cp -r test_ui/* . && rm -rf test_ui

FROM base AS development

# Copy the entire application directory
COPY . .

# Install node modules for development build
RUN npm install

# Expose the default port for React
EXPOSE 3000

# Execute React development server
CMD ["npm", "run", "dev"]
