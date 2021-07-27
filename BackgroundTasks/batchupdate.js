const fs = require("fs");
const {
    google,
} = require("googleapis");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const KEYFILEPATH = "credentials.json";

const authClient = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});
const sheets = google.sheets({
    version: 'v4',
    auth: authClient
});
main();
async function main() {
        const request = {
            spreadsheetId: '1vnCjmN5AEKZvg9YTWmllYuBDKeYwiG5QTozYH5DMXcA',
            resource: {
                requests: [{
                    "cutPaste": {
                        "source": {
                            "sheetId": 1509149924,
                            "startRowIndex": 2,
                            "endRowIndex": 2,
                            "startColumnIndex": 6,
                            "endColumnIndex": 15
                          },
                          "destination": {
                            "sheetId": 1509149924,
          "rowIndex": 4,
          "columnIndex": 6
                          },
                          "pasteType": "PASTE_NORMAL"
                      },
                }],
            },
        };
        try {
            const response = (await sheets.spreadsheets.batchUpdate(request)).data;
            console.log(JSON.stringify(response, null, 2));
        } catch (err) {
            console.error(err);
        }
}
