#!/bin/bash

# Script to convert integration tests from direct route imports to HTTP requests
# This replaces:
# 1. Route function imports with http-client imports
# 2. Direct route calls with http.post/get/put/delete calls
# 3. createMockRequest with direct HTTP calls

set -e

cd "$(dirname "$0")"

echo "Converting integration tests to use HTTP requests..."

for file in *.test.ts; do
  if [ "$file" = "sessions.test.ts" ]; then
    echo "Skipping $file (already converted)"
    continue
  fi

  echo "Processing $file..."

  # Backup original
  cp "$file" "$file.backup"

  # Replace imports
  sed -i '' 's/import.*from.*route.*;/\/\/ Converted to HTTP client/g' "$file"
  sed -i '' 's/import.*createMockRequest.*test-helpers.*;/import { http, parseResponse } from ".\/http-client";/g' "$file"

  # Remove repository imports and clear calls
  sed -i '' '/InMemoryGameSessionRepository/d' "$file"
  sed -i '' '/InMemoryParticipantRepository/d' "$file"
  sed -i '' '/InMemoryTeamRepository/d' "$file"
  sed -i '' '/InMemoryVoteRepository/d' "$file"
  sed -i '' '/clearAll()/d' "$file"

  echo "  ✓ $file converted (backup saved as $file.backup)"
done

echo ""
echo "Conversion complete!"
echo "Note: You may need to manually adjust some test logic."
echo "Backups are saved as *.test.ts.backup"
