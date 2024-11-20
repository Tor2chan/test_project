# Use the official Node.js image as the base image
#FROM node:18-alpine as builder

# Set the working directory
#WORKDIR /app

# Copy package.json and package-lock.json to the container
#COPY package*.json ./

# Install dependencies
#RUN npm install

# ENV PATH="./node_modules/.bin:$PATH"
#COPY . ./

#RUN npm run build

FROM --platform=linux/amd64 nginx:alpine3.18-slim

# Copy the build output from the previous stage
#COPY --from=builder app/dist/swu-lifelong-ui /usr/share/nginx/html
COPY dist/swu-lifelong-ui /usr/share/nginx/html

# Not /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the world outside this container
EXPOSE 80

# Command to run the Angular app in production
CMD ["nginx", "-g", "daemon off;"]
