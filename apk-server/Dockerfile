FROM nginx:alpine

# Copy APK file
COPY ./application-c03cfe46-3167-42a4-8741-e59359ab7e61.apk /usr/share/nginx/html/caremate.apk

# Copy custom landing page
COPY ./index.html /usr/share/nginx/html/index.html

# Custom nginx config for APK serving
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
