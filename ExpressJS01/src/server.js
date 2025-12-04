require('dotenv').config();

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const configViewEngine = require('./config/viewEngine');
const apiRoutes = require('./routes/api');
const connection = require('./config/database');
const {getHomePage} = require('./controllers/homeController');
const cors = require('cors');
const graphqlSchema = require('./graphql/schema');
const graphqlAuth = require('./middleware/graphqlAuth');
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

// GraphQL endpoint
app.use(
  '/graphql',
  graphqlAuth, // Middleware để xác thực và lấy thông tin user
  graphqlHTTP((req) => ({
    schema: graphqlSchema,
    graphiql: true, // Bật GraphiQL UI để test (có thể tắt trong production)
    context: {
      user: req.user, // Truyền thông tin user vào context để resolvers sử dụng
    },
    customFormatErrorFn: (err) => {
      // Format error message
      return {
        message: err.message,
        locations: err.locations,
        path: err.path,
      };
    },
  }))
);

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
