FROM python:3.11-slim

# Cài snap7 system library + python binding
RUN apt-get update && apt-get install -y libsnap7-1 libsnap7-dev && rm -rf /var/lib/apt/lists/*
RUN pip install python-snap7

WORKDIR /app
COPY plc_sim.py .

# Port 102 là cổng S7 Protocol (ISO on TCP)
EXPOSE 102

CMD ["python", "-u", "plc_sim.py"]
