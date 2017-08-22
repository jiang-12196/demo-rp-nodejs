FROM node:8.2.1-alpine

ADD ./node_modules ./node_modules
ADD ./src ./src
ADD ./views ./views
ADD ./package.json ./package.json
ADD ./app.js ./app.js

ENTRYPOINT ["/usr/local/bin/node"]

CMD ["app.js"]