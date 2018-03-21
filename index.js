const fs = require('fs');
const express = require('express');
const port =  3000;
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const ERRORS_COUNT_FILE = 'errors_count.txt';
const STOCK_COUNT_FILE = 'stock_count.txt';

app.use(bodyParser.json());
app.use(morgan('tiny'));

app.get('/error_status', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  readCount(ERRORS_COUNT_FILE)
  .then(number => res.json({ server_status: 'Up', number_of_errors: number, ip: ip }) )
  .catch(e => res.json({ server_status: 'Up but read count error', error: e, ip: ip }));
});

app.get('/stock_status', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  readCount(STOCK_COUNT_FILE)
  .then(number => res.json({ server_status: 'Up', number_of_errors: number, ip: ip }) )
  .catch(e => res.json({ server_status: 'Up but read count error', error: e, ip: ip }));
});


app.post('/report', (req, res) => {
  new Promise((resolve, reject) => {    
    const { key, error } = req.body;
    
    fs.appendFile('errors.csv', `${key},${error},${new Date()}\r\n`, err => {
      if (err) reject(err);
      
      readCount(ERRORS_COUNT_FILE)
      .then(count(ERRORS_COUNT_FILE))
      .catch(e => reject(e));

      resolve(`${key},${error} saved!\r\n`);
    });
  })
  .then(message => console.log(message))
  .catch(e => console.log(e));

  res.json({ status: 'ok' });
});

app.post('/report_stock', (req, res) => {
  new Promise((resolve, reject) => {    
    const { id, warehouse_soldable, warehouse_soldable_before, stock_soldable } = req.body;
    
    fs.appendFile('stock.csv', `${id}, ${warehouse_soldable_before}, ${warehouse_soldable}, ${stock_soldable}, ${new Date()}\r\n`, err => {
      if (err) reject(err);
      
      readCount(STOCK_COUNT_FILE)
      .then(count(STOCK_COUNT_FILE))
      .catch(e => reject(e));

      resolve(`${id},${warehouse_soldable} saved!\r\n`);
    });
  })
  .then(message => console.log(message))
  .catch(e => console.log(e));

  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`app listen on port ${port}`);
});

const count = (filename) => (number) => {
  return new Promise((resolve, reject) => {
    const newNumber = number + 1;
    fs.writeFile(filename, newNumber, { flag: 'w' }, e => {
      if (e) reject(e)
       
      resolve('count succeded!');
    });
  });
}

const readCount = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) reject(err)

      const newData = data || new Buffer(0);
      const number = parseInt(newData.toString());

      resolve(number);
    });
  });
}
