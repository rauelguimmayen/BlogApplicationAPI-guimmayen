
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
//Routes Middleware
const blogRoutes = require("./routes/blog");
const userRoutes = require("./routes/user");


require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {

	origin: '*', 
	credentials: true,
	optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'))

app.use("/blogs", blogRoutes);
app.use("/users", userRoutes);

if(require.main === module){
	app.listen(process.env.PORT || 4000, () => {
	    console.log(`API is now online on port ${ process.env.PORT || 4000 }`)
	});
}

module.exports = {app,mongoose};