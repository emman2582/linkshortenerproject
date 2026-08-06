#!/bin/bash

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | grep -o '"toolName":"[^"]*"' | cut -d'"' -f4)

if [ "$TOOL_NAME" = "create" ] || [ "$TOOL_NAME" = "edit" ]; then
  npx prettier --write .
fi
