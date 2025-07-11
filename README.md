You need nodejs to run this nextjs project and openai key and need credits

Project Repo
https://github.com/Zedcodin/realtimeassistant.git

Instructions to run locally
Clone the Repo

run these commands
git clone https://github.com/Zedcodin/realtimeassistant.git
rename .env.example to .env and add your openai key will look like:
OPENAI_API_KEY = <key>

enter projects root and run:

npm install or npm i

npm run dev  -> this runs the project

project will open on:
http://localhost:3000


you can update the system instruction or assistants instruction to improve the response. 

Open server.js you will find folder system instruction you can update that to improve how the assistant responds to user instructions