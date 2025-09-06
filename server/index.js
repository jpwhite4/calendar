const fs = require('fs').promises;
const path = require('path');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const axios = require('axios');

const mp = {
    'Day 1': 'John: P.E.\nDorris: Music',
    'Day 2': 'John: Art, Dorris: P.E. & Art',
    'Day 3': 'John: P.E. & Orchestra, Dorris: Music',
    'Day 4': 'John: Music & Orchestra, Dorris: P.E.',
    'Day 5': 'John: P.E., Dorris: LMC',
    'Day 6': 'John: LMC, Dorris: P.E.'
};

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        console.log(err);
        return null;
    }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEvents(auth, start, end) {

    const calendar = google.calendar({version: 'v3', auth});
    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    });
    const events = res.data.items;
    if (!events || events.length === 0) {
        console.log('No upcoming events found.');
        return [];
    }

    return events;
}

async function getSchoolEvents(start, end) {

    const {data} = await axios.post(
        'https://cas.hamburgschools.org/Common/controls/WorkspaceCalendar/ws/WorkspaceCalendarWS.asmx/Modern_Events',
        {
            "portletInstanceId":"425931",
            "primaryCalendarId":"18925714",
            "calendarIds":["18925714"],
            "localFromDate": start.toISOString(),
            "localToDate": end.toISOString(),
            "filterFieldValue":"",
            "searchText":"",
            "categoryFieldValue":"",
            "filterOptions":[]
        }
    );

    let events = []
    for (let i = 0; i < data.d.events.length; i++) {
        const ename = data.d.events[i].name;
        const eventDate = data.d.events[i].localStartDate;
        if (mp[ename]) {
            events.push({
                id: start.toISOString() + '-' + ename.replace(' ', '-') + '-' + eventDate.replace(' ', '-'),
                summary: ename,
                description: mp[ename],
                allday: true,
                start: {
                    dateTime: eventDate
                }
            });
        }
    }
    
    return events;
}

async function main() {

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(+start);
    end.setDate(end.getDate() + 2);

    const auth = await authorize();
    const googleEvents = await listEvents(auth, start, end);
    const schoolEvents = await getSchoolEvents(start, end);

    console.log(JSON.stringify(schoolEvents.concat(googleEvents), null, 4));
}

main();
