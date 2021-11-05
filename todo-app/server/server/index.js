const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
const tasks = require('./routes/api/tasks');
const projects = require('./routes/api/projects');
const labels = require('./routes/api/labels');

app.use('/api/tasks', tasks);
app.use('/api/projects', projects);
app.use('/api/labels', labels);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
