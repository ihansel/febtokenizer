#!/bin/bash

echo "Starting FebTokenizer server..."
echo "Open your browser and navigate to http://localhost:8000"

# Check if Python is installed
if command -v python3 &>/dev/null; then
    python3 -m http.server 8000
elif command -v python &>/dev/null; then
    python -m http.server 8000
else
    echo "Error: Python is not installed. Please install Python or manually open the index.html file in your browser."
    exit 1
fi 