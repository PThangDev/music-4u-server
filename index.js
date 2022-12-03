const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/connectDB');
const routes = require('./routes');
const errorsHandlingMiddleware = require('./middlewares/errorHandlingMiddleware');

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

//Connect MongoDB Atlas
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
// Routes
app.use('/api/v2', routes);

//Error Handling
app.use(errorsHandlingMiddleware);
app.listen(PORT, () => {
  console.log(`App listening on PORT: ${PORT}`);
});
