FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    curl zip unzip git \
    libpng-dev libonig-dev libxml2-dev libzip-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring bcmath zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY backend/ .

RUN composer install --no-dev --optimize-autoloader \
    && mkdir -p storage/framework/{cache/data,sessions,views} storage/app/public storage/logs \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

CMD sh -c "\
    chown -R www-data:www-data /app/storage /app/bootstrap/cache && \
    chmod -R 775 /app/storage /app/bootstrap/cache && \
    until php artisan migrate --force 2>&1; do \
        echo 'MySQL not ready, retrying in 3s...'; sleep 3; \
    done && \
    php artisan storage:link --force 2>/dev/null || true && \
    php-fpm"
