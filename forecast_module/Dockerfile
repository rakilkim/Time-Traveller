FROM python:3.11

WORKDIR /usr/src/app

COPY forecast_module/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY frontend_module/ .

EXPOSE 8000

CMD python ./app/main.py