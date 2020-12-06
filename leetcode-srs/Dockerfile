#Step 1 - build the production version of the app
FROM node:alpine as builder
# Make the workdir folder
RUN mkdir /client
WORKDIR '/client'
COPY ./package.json ./
RUN npm install
COPY . .
# Build the project
#CMD ["npm", "run", "build"]
RUN npm run build

# Step 2 - Create our nginx instance to route our react app stuff
FROM nginx:alpine
#COPY --from=builder /client/dist /usr/share/nginx/html
#COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# Remove the default index page from nginx
#RUN rm -rf /usr/share/nginx/html/*

# Copy our built app from step 1
COPY --from=builder /client/build /usr/share/nginx/html

# EXPOSE 3000 80 # needed? nope - expose is 'basically a comment' according to SO
# The port mappings on our compose handle what we need

ENTRYPOINT ["nginx", "-g", "daemon off;"]
