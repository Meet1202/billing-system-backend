const express = require('express');
const app = express();
const routes = require('./src/routes/index');
const cors = require('cors');
app.use(express.json());
app.use(cors());
//ROUTES
app.use('/apis', routes);

// error handler
app.use( (error, req, res, next) => {
  let message = {};
  if(error && error.message){
    message = JSON.parse(error.message); 
  } 

  res.status(500).send({
        error: {
        status: error.status || 500,
        message: {
          server: message.server || 'Internal Server Error Please Try Again Later!',
          custom: message.custom || 'Internal Server Error Please Try Again Later!'
        }
       }
    });
  });
//LISTEN 

app.listen(3000, console.log('Listening to PORT: 3000'));
