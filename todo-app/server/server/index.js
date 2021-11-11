const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
const tasks = require('./routes/api/tasks');
const projects = require('./routes/api/projects');
const labels = require('./routes/api/labels');
const auth = require('./routes/api/auth');

app.use('/api/tasks', tasks);
app.use('/api/projects', projects);
app.use('/api/labels', labels);
app.use('/api/auth', auth);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
