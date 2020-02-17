FROM node:alpine
WORKDIR '/client'
COPY ./package.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "build"]

# Create our nginx instance to route our react app stuff
FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html