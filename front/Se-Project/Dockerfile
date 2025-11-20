# Use a Node base image
FROM node:20

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the Vite port
EXPOSE 5173

# Run the dev server
CMD ["npm", "run", "dev", "--", "--host"]
