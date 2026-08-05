const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const path = require('path');
require('dotenv').config();

// const userRoute = require('./routes/usersRoute.js');
const ApiRoute = require('./routes/apiRoute.js');
const Route = require('./routes/route.js');
const config = require('./config.js');

const MONGODB_URI = config.mongodburi || 'mongodb://localhost:27017/nft-market';
const PORT = process.env.PORT || 5050;

// mongoose.connect(MONGODB_URI, {
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
//     useCreateIndex: true
// });
// mongoose.connection.on('connected', () => {
//     console.log('Connected to MongoDB');
// });
// mongoose.connection.on('error', (error) => {
//     console.log(error);
// });

let app = express();

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client/build')));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
        res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

global.appRoot = path.resolve(__dirname);

// routing
// app.use('/api/users', userRoute);
app.use('/api', ApiRoute);
app.use('/', Route);
// end routing

// for production mode
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/build/index.html'));
// });
// end for production mode

// setting for cron jobs for getting log.txt data
// Cron.setCron();
// end setting for cron jobs

const server = app.listen(PORT, () => {
    console.log('Server started on port', PORT);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {

        // Try to find and kill the process using the port (Windows)
        const { exec } = require('child_process');
        exec(`netstat -ano | findstr :${PORT}`, (error, stdout, stderr) => {
            if (stdout) {
                const lines = stdout.trim().split('\n');
                if (lines.length > 0) {
                    const parts = lines[0].trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    if (pid && !isNaN(pid)) {
                        exec(`taskkill /F /PID ${pid}`, (err, stdout, stderr) => {
                            if (!err) {
                                setTimeout(() => {
                                    app.listen(PORT, () => {
                                    });
                                }, 1000);
                            }
                        });
                    }
                }
            }
        });
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    server.close(() => {
        process.exit(0);
    });
});
