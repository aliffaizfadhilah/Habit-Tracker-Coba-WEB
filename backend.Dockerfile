FROM php:8.4-fpm
ARG CACHEBUST=1
RUN apt-get update && apt-get install -y curl zip unzip git libpng-dev libonig-dev libxml2-dev libzip-dev && docker-php-ext-install pdo pdo_mysql mbstring bcmath zip
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY backend/ .
RUN composer install --no-dev --optimize-autoloader
CMD sh -c "chown -R www-data:www-data /app/storage /app/bootstrap/cache && php artisan key:generate --force && until php artisan migrate --force; do echo 'Waiting for MySQL, retrying in 3s...'; sleep 3; done && php-fpm"
