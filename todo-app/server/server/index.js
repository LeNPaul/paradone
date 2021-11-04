const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
const projects = require('./routes/api/projects');

app.use('/api/projects', projects);

const port = process.env.PORT || 5050;

app.listen(port, () => console.log(`Server started on port ${port}`));
