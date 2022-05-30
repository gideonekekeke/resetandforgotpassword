const mongoose = require("mongoose");
const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		avatar: {
			type: String,
			default: "https://i.stack.imgur.com/l60Hf.png",
		},
		avatarID: {
			type: String,
		},
		OTP: {
			type: String,
		},
		mainOtp: {
			type: String,
		},
		isVerified: {
			type: Boolean,
		},
		isAdmin: {
			type: Boolean,
		},

		verifiedToken: {
			type: String,
		},
		item: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "items",
			},
		],
	},

	{ timestamps: true },
);

module.exports = mongoose.model("users", userSchema);
