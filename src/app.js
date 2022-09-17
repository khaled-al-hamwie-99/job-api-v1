const connect = require('./db/connect');
require('express-async-errors');

// extra security packages
const helmet = require('helmet')
const cors = require("cors")
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')

const express = require('express');
const app = express();

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
// midlewares
const auth = require('./middleware/authentication')
// Routers
const authRouter = require('./routes/auth')
const jobRouter = require('./routes/jobs')

app.set('trust proxy', 1)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per `window` (here, per 15 minutes)
}))


app.use(express.json());
// extra packages
app.use(helmet())
app.use(cors())
app.use(xss())
// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', auth, jobRouter)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await connect(process.env.MONGODB_URL)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
    process.exit(1)
  }
};

start();