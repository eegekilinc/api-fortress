# Temel Python sürümü
FROM python:3.10-slim

# Çalışma klasörü
WORKDIR /app

# Kütüphane listesi
COPY services/api_insecure/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Projedeki tüm kodları kapsülün içine kopyalar
COPY . .