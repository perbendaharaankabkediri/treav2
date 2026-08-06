FROM php:8.2-apache

ENV APACHE_DOCUMENT_ROOT=/var/www/public

# System packages and PHP extensions required by the application.
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        git \
        libonig-dev \
        libpng-dev \
        libpq-dev \
        libxml2-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        exif \
        gd \
        mbstring \
        opcache \
        pcntl \
        pdo_pgsql \
        zip \
    && a2enmod deflate expires headers rewrite \
    && sed -ri -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" \
        /etc/apache2/sites-available/*.conf \
        /etc/apache2/apache2.conf \
        /etc/apache2/conf-available/*.conf \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Node is only used to compile the Vite assets during the image build.
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY . /var/www

RUN composer install \
        --no-dev \
        --no-interaction \
        --no-progress \
        --prefer-dist \
        --classmap-authoritative \
    && npm ci \
    && npm run build \
    && npm cache clean --force \
    && rm -rf node_modules \
    && apt-get purge -y nodejs \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/* \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod +x docker/entrypoint.sh

COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/99-opcache.ini
COPY docker/php/performance.ini /usr/local/etc/php/conf.d/99-performance.ini

EXPOSE 80

ENTRYPOINT ["/var/www/docker/entrypoint.sh"]
CMD ["apache2-foreground"]
