const userModel = require("../Models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const verifiedModel = require("../Models/verifiedModel");
const transport = require("../utils/email");
const cloudinary = require("cloudinary").v2;
// const verifiedModel= require('../Models/verifiedModel')
// require("dotenv").config();

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: "478564868449943",
	api_secret: process.env.CLOUD_SECRET,
	secure: true,
});

const getAllUsers = async (req, res) => {
	try {
		const user = await userModel.find();
		res.status(200).json({
			message: "success",
			data: user,
		});
	} catch (error) {
		res.status(404).json({
			message: error.message,
		});
	}
};

const getSingleUser = async (req, res) => {
	try {
		const user = await userModel.findById(req.params.id);
		res.status(200).json({
			message: "success",
			data: user,
		});
	} catch (error) {
		res.status(404).json({
			message: error.message,
		});
	}
};

const editSingleUser = async (req, res) => {
	try {
		const { fullName, phone, email } = req.body;

		const user = await userModel.findOne({ email });
		if (user) {
			await cloudinary.uploader.destroy(user.avatarID);
			const image = await cloudinary.uploader.upload(req.file.path);
			const mainUser = await userModel.findByIdAndUpdate(
				req.params.id,
				{
					fullName,
					phone,
					avatar: image.secure_url,
					avatarID: image.public_id,
				},
				{ new: true },
			);
			res.status(200).json({
				message: "success",
				data: mainUser,
			});
		} else {
			res.status(404).json({
				message: error.message,
			});
		}
	} catch (error) {
		res.status(404).json({
			message: error.message,
		});
	}
};

const RegisterUser = async (req, res) => {
	try {
		const { name, email, password } = req.body;
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);

		const tokenValue = crypto.randomBytes(64).toString("hex");
		const image = await cloudinary.uploader.upload(req.file.path);
		const myToken = jwt.sign({ tokenValue }, process.env.SECRET_KEY, {
			expiresIn: "20m",
		});

		const user = await userModel.create({
			email,
			password: hash,
			name,
			avatar: image.secure_url,
			avatarID: image.public_id,
			verifiedToken: myToken,
		});

		await verifiedModel.create({
			token: myToken,
			userID: user._id,
			_id: user._id,
		});

		const mailOption = {
			from: "ajmarketplace52@gmail.com",
			to: email,
			subject: "Account verification",
			html: `
            <h3>
            Thanks for sign up with us ${user.name}, Please use the <a
            href="http://localhost:5000/api/user/${user._id}/${myToken}"
            >Link to complete your sign up</a>
            </h3>
            `,
		};

		transport.sendMail(mailOption, (err, info) => {
			if (err) {
				console.log(err.message);
			} else {
				console.log("Email has been sent");
			}
		});
		res.status(201).json({
			message: "Check your inbox to continue...!",
		});
	} catch (error) {
		res.status(404).json({
			message: error.message,
		});
	}
};

const verifiedUser = async (req, res) => {
	try {
		const user = await userModel.findById(req.params.id);

		if (user) {
			if (user.verifiedToken !== "") {
				await userModel.findByIdAndUpdate(
					user._id,
					{
						isVerified: true,
						verifiedToken: "",
					},
					{ new: true },
				);

				await verifiedModel.findByIdAndUpdate(
					user._id,
					{
						userID: user._id,
						token: "",
					},
					{ new: true },
				);

				res.status(201).json({
					message: "Verification complete, you can go sign in now!",
				});
			} else {
				res.status(404).json({
					messsage: error.message,
				});
			}
		} else {
			res.status(404).json({
				message: error.message,
			});
		}
	} catch (error) {
		res.status(404).json({
			message: error.message,
		});
	}
};

const forgetPasswords = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await userModel.findOne({ email });

		if (user) {
			if (user.isVerified && user.verifiedToken === "") {
				const tokenValue = crypto.randomBytes(64).toString("hex");

				const myToken = jwt.sign({ tokenValue }, process.env.SECRET_KEY, {
					expiresIn: "20m",
				});

				await userModel.findByIdAndUpdate(
					user._id,
					{
						verifiedToken: myToken,
					},
					{ new: true },
				);

				const mailOptions = {
					from: "ajmarketplace52@gmail.com",
					to: email,
					subject: "Reset Password",
					html: `
            <h3>
            You requested for password reset ${user.name}, Please use the <a
            href="http://localhost:5000/api/user/reset/${user._id}/${myToken}"
            >Link to complete your sign up use your secret key to complete this sign up: </a><h2></h2> 
            </h3>
            `,
				};

				transport.sendMail(mailOptions, (err, info) => {
					if (err) {
						console.log(err.message);
					} else {
						console.log("Email has been sent to your inbox", info.response);
					}
				});

				res.status(201).json({
					message: "Check your inbox to continue...!",
				});
			} else {
				res.status(201).json({ message: "This can't be carried out" });
			}
		} else {
			res.status(201).json({ message: "user is not in our database" });
		}
	} catch (error) {
		res.status(404).json({
			message: error.message,
		});
	}
};

const newPassword = async (req, res) => {
	try {
		const { password } = req.body;
		const user = await userModel.findById(req.params.id);

		if (user) {
			if (user.verifiedToken === req.params.token) {
				const salt = await bcrypt.genSalt(10);
				const hashed = await bcrypt.hash(password, salt);

				await userModel.findByIdAndUpdate(
					user._id,
					{
						password: hashed,
						verifiedToken: "",
					},
					{ new: true },
				);

				res.status(201).json({
					message: "Your password has been changed, please sign in now!",
				});
			} else {
				res.status(201).json({ message: "wrong token, access deny" });
			}
		} else {
			res.status(201).json({ message: "user is not in our database" });
		}
	} catch (error) {
		res.status(404).json({
			message: error.message,
		});
	}
};

module.exports = {
	RegisterUser,
	getAllUsers,
	getSingleUser,
	editSingleUser,
	verifiedUser,
	forgetPasswords,
	newPassword,
};
