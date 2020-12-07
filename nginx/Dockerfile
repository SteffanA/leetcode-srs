# Create a reverse proxy using Nginx
FROM nginx:alpine
COPY ./default.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
