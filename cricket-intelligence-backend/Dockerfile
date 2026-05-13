# Use professional lightweight Python image
FROM python:3.11-slim

# Set system working directory
WORKDIR /app

# Install system dependencies for Pandas
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Transfer and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy tactical source code
COPY . .

# Expose Intelligence Uplink Port
EXPOSE 5000

# Launch Engine
CMD ["python", "app.py"]