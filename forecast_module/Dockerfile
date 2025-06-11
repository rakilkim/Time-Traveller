FROM python:3.11

WORKDIR /usr/src/app

COPY . .

RUN pip install -r requirements.txt

EXPOSE 8000

CMD python ./app/main.py