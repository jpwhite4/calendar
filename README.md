
# Install

```
cd ~/
git clone https://github.com/jpwhite4/calendar
```

# Running

Setup the tablet to automatically login. Then as the logged in 
user set it to run the following script:

```bash
#!/bin/bash

cd ~/calendar/server/

node server.js > server.log 2>&1 &

cd ~/calendar/client/
npm run dev > client.log 2>&1 &

env MOZ_USE_XINPUT2=1 firefox -kiosk http://localhost:5173
```

I put this script in ~/bin/kiosk and used the Linux Mint Preferences GUI
to set it as a `Startup Application` with a 30 second delay. I assume a
shorter delay will work, but if it aint broke then I'm not going to fix it.

