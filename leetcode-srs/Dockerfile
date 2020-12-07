#Step 1 - build the production version of the app
FROM node:alpine as builder
# Make the workdir folder
RUN mkdir /client
WORKDIR '/client'
COPY ./package.json ./
RUN npm install
COPY . .
# Build the project
RUN npm run build

# Step 2 - Create our nginx instance to route our react app stuff
FROM nginx:alpine
# Remove the default config.
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
# Remove the default index page from nginx

# Copy our built app from step 1
COPY --from=builder /client/build /usr/share/nginx/html

ENTRYPOINT ["nginx", "-g", "daemon off;"]
