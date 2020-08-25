
const express = require('express');
const cors = require('cors');
require('dotenv').config();

//Cloudant Stuff.
const Cloudant = require("@cloudant/cloudant");
const username = process.env.cloudant_username;
const url = 'https://' + username + '.cloudant.com';
const apiKey = process.env.cloudant_api_key;

let cloudant;
let db;

setUpCloudant(); //Assigns values to the above cloudant variables.


//Has to be async because of the database.
async function setUpCloudant() {
    cloudant = await Cloudant({ url: url, plugins: { iamauth: { iamApiKey: apiKey } } } );

    db = cloudant.db.use('actions_db');

    return;

    // db.index(function(err, result) {
    //     if (err) {
    //       throw err;
    //     }
      
    //     console.log('The database has %d indexes', result.indexes.length);
    //     for (var i = 0; i < result.indexes.length; i++) {
    //       console.log('  %s (%s): %j', result.indexes[i].name, result.indexes[i].type, result.indexes[i].def);
    //     }
    // });
    // //let db = await getCloudantDB(await cloudant);

    // const scheduleSlot = {
    //     ate: true,
    //     peed: false,
    //     pooped: true,
    //     walked: true,
    //     timestamp: new Date()
    // };

    //CODE TO INSERT A DOCUMENT.
    // db.insert(scheduleSlot).then( (body) => {
    //     console.log(body);
    // })

    //CODE TO GET DOCUMENTS BY TIMESTAMP.
    const allTimes = {
        "selector": {
           "timestamp": {
              "$gt": "0"
           }
        },
        "fields": [
           "ate",
           "peed",
           "pooped",
           "walked",
           "timestamp"
        ],
        "sort": [
           {
              "timestamp": "desc"
           }
        ]
    };

    db.find(allTimes, function(err, result) {
        if (err) {
          throw err;
        }
      
        console.log('Found %d documents with query', result.docs.length);
        for (var i = 0; i < result.docs.length; i++) {
          console.log( result.docs[i] );
        }
    });
    
    console.log('done');
}


const app = express();

app.enable('trust proxy');
app.use( cors() );
app.use(express.json());


//CHANGE HERE TO ONLY RETURN TIMESTAMPS FROM SUNDAY OF THIS WEEK.
app.get('/actions', (req, res) => {

    const lastSunday = getLastSunday(); //Returns a string.

    const timeQuery = getTimeQuery(lastSunday) ;

    db.find(timeQuery, function(err, result) {
        if (err) {
          throw err;
        }

        //add the last sunday's date to the json?
        res.json(result.docs);
    });

});

app.use( (error, req, res, next) => {
    res.status(500);
    res.json({
        message: error.message
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Request successfully recieved.'
    });

    console.log('Received: ' + req);
});


function getTimeQuery( timestamp ) {
    const timeQuery = {
        "selector": {
           "timestamp": {
              "$gt": timestamp.toString()
           }
        },
        "fields": [
           "ate",
           "peed",
           "pooped",
           "walked",
           "woke",
           "slept",
           "timestamp"
        ],
        "sort": [
           {
              "timestamp": "desc"
           }
        ]
    };

    return timeQuery;
}


const insertActions = (req, res) => {
    const actions = {
        ate: req.body.ate.toString(),
        peed: req.body.peed.toString(),
        pooped: req.body.pooped.toString(),
        walked: req.body.walked.toString(),
        woke: req.body.woke.toString(),
        slept: req.body.woke.toString(),
        timestamp: req.body.timestamp.toString()
    };

    db.insert(actions).then( (body) => {
        //console.log(body); //Outputs the response from the cloudant server. Gives the id and revision number.
        res.json(actions);
    });

}

app.post('/actions', insertActions);


function getLastSunday( givenDate = null ) {
    let currentDate = givenDate;

    if(currentDate === null) {
        currentDate = new Date(); //Sets it to today.
    }

    let dateNum = currentDate.getDate();
    let dayName = currentDate.toDateString().substr(0,3); //Find best way to get day of week.

    while(dayName !== "Sun" ) {
        currentDate.setDate(--dateNum);
        dayName = currentDate.toDateString().substr(0,3);
    }

    currentDate.setMilliseconds(0);
    currentDate.setSeconds(0);
    currentDate.setMinutes(0);
    currentDate.setHours(3);

    return currentDate.toLocaleString();
}

app.listen(5000, () => {
    console.log(url);
    console.log('Listening on http://localhost:5000');
})