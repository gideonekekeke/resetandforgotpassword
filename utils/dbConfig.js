const mongoose = require("mongoose");

mongoose
	.connect(process.env.URL)
	.then(() => {
		console.log("database is connected successfully");
	})
	.catch(() => {
		console.log("an error occured and cannot connect t database....");
	});
