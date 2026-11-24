FROM python:3.11-slim

WORKDIR /app

ENV PYTHONPATH=/app
ENV FLASK_APP=services.api_insecure.app:app

COPY services/api_insecure/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY services /app/services

EXPOSE 5001

CMD ["flask", "run", "--host=0.0.0.0", "--port=5001"]
