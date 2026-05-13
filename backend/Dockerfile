FROM php:8.4-fpm
ARG CACHEBUST=1
RUN apt-get update && apt-get install -y curl zip unzip git libpng-dev libonig-dev libxml2-dev libzip-dev && docker-php-ext-install pdo pdo_mysql mbstring bcmath zip
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY backend/ .
RUN composer install --no-dev --optimize-autoloader
RUN php artisan key:generate --force
CMD sh -c "php artisan migrate --force 2>/dev/null || true && php-fpm"
