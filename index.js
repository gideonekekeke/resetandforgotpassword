const express = require("express");
require("dotenv").config();
require("./utils/dbConfig");
const port = 5000;

const app = express();
app.use(express.json())
app.get("/", (req, res) => {
	res.send("api is working fine");
});

app.use("/api/user", require("./Routes/userRouter"));

app.listen(port, () => {
	console.log(`listening on port ${port}`);
});
