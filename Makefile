build:
	docker build -t voicebot .
run:
	docker run -d -p 3000:3000 --name voicebot --rm voicebot
