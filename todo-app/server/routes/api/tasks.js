const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const auth = require('../../middleware/auth')


// Node.js program to demonstrate the
// crypto.createDecipheriv() method

// Includes crypto module
const crypto = require('crypto');

// Difining algorithm
const algorithm = 'aes-256-cbc';

// Defining key
const key = crypto.randomBytes(32);

// Defining iv
const iv = crypto.randomBytes(16);

// An encrypt function
function encrypt(text) {

 // Creating Cipheriv with its parameter
 let cipher =
    crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);

 // Updating text
 let encrypted = cipher.update(text);

 // Using concatenation
 encrypted = Buffer.concat([encrypted, cipher.final()]);

 // Returning iv and encrypted data
 return { iv: iv.toString('hex'),
     encryptedData: encrypted.toString('hex') };
}

// A decrypt function
function decrypt(text) {

 let iv = Buffer.from(text.iv, 'hex');
 let encryptedText =
    Buffer.from(text.encryptedData, 'hex');

 // Creating Decipher
 let decipher = crypto.createDecipheriv(
        'aes-256-cbc', Buffer.from(key), iv);

 // Updating encrypted text
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);

 // returns data after decryption
 return decrypted.toString();
}


// Task model
const Task = require('../../models/Task');

// @route  GET api/tasks
// @desc   Get user tasks and filter by project if param exists
// @access Private
router.get('/', auth, async (req, res) => {
  let filter = {}
  if(req.query.project) {
    filter = {project: req.query.project}
  }
  res.send(await Task.find(filter));
});

// @route  GET api/tasks/:id
// @desc   Get a user task by id
// @access Private
router.get('/:id', auth, async (req, res) => {
  const task = await Task.findOne({ _id: new mongodb.ObjectID(req.params.id) });
  res.status(200).send(task);
});

// @route  POST api/tasks
// @desc   Create a new task
// @access Private
router.post('/', auth, async (req, res) => {
  const task = {
    content:  req.body.content,
    label:    req.body.label,
    priority: req.body.priority,
    project:  req.body.project
  }
  const insertedTask = await Task.create(task);
  task._id = insertedTask._id;
  res.status(201).send(task);
});

// @route  PUT api/tasks/:id
// @desc   Update an existing task
// @access Private
router.put('/:id', auth, async (req, res) => {
  const task = {
    content:  req.body.content,
    label:    req.body.label,
    priority: req.body.priority,
    project:  req.body.project
  }
  const updatedTask = await Task.findOneAndUpdate(
    { _id: new mongodb.ObjectID(req.params.id) },
    { $set: task }
  );
  task._id = updatedTask._id;
  res.status(200).send(task);
});

// @route  DELETE api/tasks/:id
// @desc   Delete an existing task
// @access Private
router.delete('/:id', auth, async (req, res) => {
  await Task.deleteOne({ _id: new mongodb.ObjectID(req.params.id) });
  res.status(200).send({});
});

module.exports = router;
