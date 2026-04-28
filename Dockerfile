FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    curl zip unzip git \
    libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring bcmath zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY backend/ .

RUN composer install --no-dev --optimize-autoloader

EXPOSE 8000
CMD sh -c "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"
