FROM python:3.11-slim

WORKDIR /app

ENV PYTHONPATH=/app
ENV FLASK_APP=services.api_secure.app:app

COPY services/api_secure/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY services /app/services

EXPOSE 5002

CMD ["flask", "run", "--host=0.0.0.0", "--port=5002"]
