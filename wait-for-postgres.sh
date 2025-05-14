#!/bin/sh
# wait-for-postgres.sh

set -e

host="$1"
shift
cmd="$@"

# Check if pg_isready is available, otherwise use nc
if command -v pg_isready >/dev/null 2>&1; then
  until pg_isready -h "$host" -p "${PGPORT:-5432}" -U "${PGUSER:-postgres}" -q; do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 1
  done
else
  # Fallback to nc if pg_isready is not available (requires nc to be installed)
  # Ensure PGPORT is set, default to 5432 if not
  resolved_port=${PGPORT:-5432}
  until nc -z -v "$host" "$resolved_port"; do
    >&2 echo "Postgres is unavailable (using nc) - sleeping"
    sleep 1
  done
fi

>&2 echo "Postgres is up - executing command"
exec $cmd

