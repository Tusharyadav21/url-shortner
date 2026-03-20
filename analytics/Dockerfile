FROM python:3.11-slim
WORKDIR /app
COPY analytics/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY . /app
EXPOSE 8003
CMD ["uvicorn", "analytics.routes:app", "--host", "0.0.0.0", "--port", "8003"]
