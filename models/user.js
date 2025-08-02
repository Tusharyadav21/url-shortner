import { Schema, model } from "mongoose";
import { hash, compare } from "bcrypt";

const LOCK_TIME = 30 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

const userSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: [2, "Name must be at least 2 characters"],
			maxlength: [
				50,
				"Name must be less than 50 characters",
			],
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
			index: true,
		},
		role: {
			type: String,
			enum: ["USER", "ADMIN"],
			default: "USER",
			index: true,
		},
		password: {
			type: String,
			required: true,
			minlength: [
				6,
				"Password must be at least 6 characters",
			],
			select: false,
		},
		lastLogin: { type: Date, default: null },
		isActive: { type: Boolean, default: true, index: true },
		loginAttempts: { type: Number, default: 0 },
		lockUntil: { type: Date, default: null },
	},
	{ timestamps: true, versionKey: false }
);

// Virtual: Is account currently locked?
userSchema.virtual("isLocked").get(function () {
	return this.lockUntil && this.lockUntil > Date.now();
});

// Pre-save hook: Hash password if modified
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	this.password = await hash(this.password, 10);
	next();
});

// Instance method: Compare password
userSchema.methods.comparePassword = async function (
	candidatePassword
) {
	return compare(candidatePassword, this.password);
};

// Instance method: Increment login attempts & lock if needed
userSchema.methods.incrementLoginAttempts =
	async function () {
		// Reset attempts if lock expired
		if (this.lockUntil && this.lockUntil < Date.now()) {
			this.loginAttempts = 1;
			this.lockUntil = null;
		} else {
			this.loginAttempts += 1;
			if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
				this.lockUntil = new Date(Date.now() + LOCK_TIME);
			}
		}
		await this.save({ validateBeforeSave: false });
	};

// Instance method: Reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
	this.loginAttempts = 0;
	this.lockUntil = null;
	await this.save({ validateBeforeSave: false });
};

// Instance method: Update last login timestamp
userSchema.methods.updateLastLogin = async function () {
	this.lastLogin = new Date();
	await this.save({ validateBeforeSave: false });
};

// Virtual: Public safe profile
userSchema.virtual("publicProfile").get(function () {
	return {
		id: this._id,
		name: this.name,
		email: this.email,
		role: this.role,
		lastLogin: this.lastLogin,
		isActive: this.isActive,
	};
});

const User = model("User", userSchema);
export default User;
