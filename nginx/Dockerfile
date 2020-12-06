# Create a reverse proxy using Nginx
FROM nginx:alpine

COPY ./default.conf /etc/nginx/conf.d/default.conf
# Remove the default index page
# RUN rm -rf /usr/share/nginx/html/*
CMD ["nginx", "-g", "daemon off;"]
