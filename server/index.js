const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const config = require('config');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// DB Config
const db = config.get('mongoURI');

// Connect to MongoDB
mongoose.connect(db)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Routes
const auth = require('./routes/api/auth');
const users = require('./routes/api/users');
const sync = require('./routes/api/integration/sync');
const settings = require('./routes/api/settings');
const integrations = require('./routes/api/integrations');

app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/sync', sync);
app.use('/api/settings', settings);
app.use('/api/integrations', integrations);

// Static folder
app.use(express.static(__dirname + '/public/'));

// Handle production SPA when built
app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));

const port = process.env.PORT || 7070;

app.listen(port, () => console.log(`Server started on port ${port}`));

// Run integration jobs
const Integration = require('./models/Integration');
const Setting = require('./models/Setting');
const nodeCron = require("node-cron");
const axios = require('axios');
const job = nodeCron.schedule("* * * * * *", function sync() {
  Integration.find({ is_active: true })
    .then(integrations => {
      // For each integration, find user settings using userID
      for (let i = 0 ; i < integrations.length ; i++) {
        let settings = Setting.find({user_id: integrations[i].user_id}).then(async settings => {
          if(settings[0].notion_api_token && settings[0].todoist_api_token) {
            let todoistRequestHeader = {
              headers: {
                'Authorization': 'Bearer ' + settings[0].todoist_api_token
              }
            }
            let notionRequestHeader = {
              headers: {
                'Authorization': 'Bearer ' + settings[0].notion_api_token,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
              }
            }
            console.log(todoistRequestHeader)
            console.log(notionRequestHeader);
            // Query Notion for database with "req.body.notionDatabase" in the title and extract database ID
            let notionDatabaseResults
            try {
              notionDatabaseResults = await axios.post('https://api.notion.com/v1/search', { 'query': integrations[i].destination_modifier }, notionRequestHeader);
            } catch (error) {
              console.log({'Error': error.response.data.message})
              return
            }
            let notionDatabaseId
            if (notionDatabaseResults.data.results.length == 0) {
              console.log({'Error': 'Notion - Database with name ' + integrations[i].destination_modifier + ' not found.' })
              return
            } else {
              notionDatabaseId = notionDatabaseResults.data.results[0].id
            }
            console.log(notionDatabaseId)
          }
        })
      }
    })
});
