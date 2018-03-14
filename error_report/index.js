const fs = require('fs');
const express = require('express');
const port =  3000;
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const FILENAME = 'count.txt';

app.use(bodyParser.json());
app.use(morgan('tiny'));

app.get('/status', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  readCount()
  .then(number => res.json({ server_status: 'Up', number_of_errors: number, ip: ip }) )
  .catch(e => res.json({ server_status: 'Up but read count error', error: e, ip: ip }));
});

app.post('/report', (req, res) => {
  new Promise((resolve, reject) => {    
    const { key, error } = req.body;
    
    fs.appendFile('errors.csv', `${key},${error}\r\n`, err => {
      if (err) reject(err);
      
      readCount()
      .then(count)
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
    const { id, warehouse_soldable } = req.body;
    
    fs.appendFile('stock.csv', `${id},${warehouse_soldable}\r\n`, err => {
      if (err) reject(err);
      
      readCount()
      .then(count)
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

const count = (number) => {
  return new Promise((resolve, reject) => {
    const newNumber = number + 1;
    fs.writeFile(FILENAME, newNumber, e => {
      if (e) reject(e)
       
      resolve('count succeded!');
    });
  });
}

const readCount = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(FILENAME, (err, data) => {
      if (err) reject(err)

      const number = parseInt(data.toString());

      resolve(number);
    });
  });
}
