#!/bin/sh
set -eu

# Build caches here, not during image creation, because production environment
# variables are injected when the container starts.
php artisan optimize

exec "$@"
