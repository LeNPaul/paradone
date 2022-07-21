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
const tasks = require('./routes/api/tasks');
const projects = require('./routes/api/projects');
const auth = require('./routes/api/auth');
const users = require('./routes/api/users');

app.use('/api/tasks', tasks);
app.use('/api/projects', projects);
app.use('/api/auth', auth);
app.use('/api/users', users);

// Static folder
app.use(express.static(__dirname + '/public/'));

// Handle production SPA when built
app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));

const port = process.env.PORT || 7070;

app.listen(port, () => console.log(`Server started on port ${port}`));
