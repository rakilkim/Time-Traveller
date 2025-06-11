FROM python:3.11

WORKDIR /usr/src/app

COPY forecast_module/requirements.txt ./

RUN pip install -r requirements.txt

COPY forecast_module/ .

EXPOSE 8000

CMD python ./app/main.py