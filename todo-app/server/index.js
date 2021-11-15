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
const labels = require('./routes/api/labels');
const auth = require('./routes/api/auth');
const users = require('./routes/api/users');

app.use('/api/tasks', tasks);
app.use('/api/projects', projects);
app.use('/api/labels', labels);
app.use('/api/auth', auth);
app.use('/api/users', users);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
