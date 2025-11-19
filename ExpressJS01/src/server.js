require('dotenv').config();

const express = require('express');
const configViewEngine = require('./config/viewEngine');
const apiRoutes = require('./routes/api');
const connection = require('./config/database');
const {getHomePage} = require('./controllers/homeController');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8080;
var cookieParser = require('cookie-parser');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
configViewEngine(app);

const webAPI = express.Router();
webAPI.get('/', getHomePage);

app.use('/v1/api/', apiRoutes);

(async () =>  {
    try {
        await connection();
        app.listen( port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Failed to connect to the database:", error);
    }
})()
