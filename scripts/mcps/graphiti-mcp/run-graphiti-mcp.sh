#!/bin/bash
cd "$(dirname "$0")/graphiti/mcp_server"
exec uv run python graphiti_mcp_server.py
