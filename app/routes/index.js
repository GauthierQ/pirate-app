var express = require('express');
var router = express.Router();
const dictionary = require('../dictionary.json');
var accounts = [];

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const CSVToJSON = require('csvtojson');
const fs = require('fs')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Pirate app' });
});

router.post('/pirate', function(req, res, next) {
  CSVToJSON().fromFile('out/out.csv')
    .then(data => {
        // Transfer saved data into a variable
        accounts = data;

        const csvWriter = createCsvWriter({
          path: 'out/out.csv',
          header: [
            {id: 'username', title: 'username'},
            {id: 'password', title: 'password'},
            {id: 'hash_method', title: 'hash_method'},
            {id: 'record_date', title: 'record_date'}
          ],
          fieldDelimiter: ';'
        });
      
        const username = req.body.username;
        const hash = req.body.hash;
      
        dictionary.forEach(element => {
          if (element.sha256 == hash) {
            accounts.push({
              username: username,
              password: element.plaintext,
              hash_method: 'sha256',
              record_date: new Date()
            });
          } else {
            null
          }
        });

        csvWriter
          .writeRecords(accounts)
          .then(()=> console.log('The CSV file was written successfully'));
        res.redirect('/');
    }).catch(err => {
        // Log error if any
        console.log(err);
    });
});

router.get('/export', (req, res, next) => {
  try {
    const data = fs.readFileSync('out/out.csv', 'utf8')
    res.header('Content-Type', 'text/csv');
    res.send(data);
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;
