import express from 'express'
import router from './routes.js'
import bodyParser from 'body-parser';


const port = 3333;
const app = express();

app.use(bodyParser.json());
app.use(router);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})