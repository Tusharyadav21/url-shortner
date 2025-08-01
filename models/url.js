const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
	{
		shortId: {
			type: String,
			required: true,
			unique: true,
			index: true,
			trim: true,
		},
		redirectedUrl: {
			type: String,
			required: true,
			trim: true,
			match: [/^https?:\/\/.+/, "Invalid URL format"],
		},
		visitHistory: [
			{
				timestamp: {
					type: Number,
					default: () => Date.now(),
					index: true,
				},
				ip: { type: String },
				userAgent: { type: String },
			},
		],
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			index: true,
			required: true,
		},
		expiresAt: {
			type: Date,
			default: null,
			index: { expires: 0 },
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

// Middleware Section
// Pre-save middleware: Normalize & sanitize data
urlSchema.pre("save", function (next) {
	this.shortId = this.shortId.trim();
	this.redirectedUrl = this.redirectedUrl.trim();
	next();
});

// Static method: Add visit record (cleaner than controller logic)
urlSchema.statics.recordVisit = async function (
	shortId,
	ip,
	userAgent
) {
	return this.findOneAndUpdate(
		{ shortId },
		{
			$push: {
				visitHistory: {
					timestamp: Date.now(),
					ip,
					userAgent,
				},
			},
		},
		{ new: true, lean: true } // Return updated doc, lean for performance
	);
};

// Pre-find middleware: Auto-exclude expired URLs
urlSchema.pre(/^find/, function (next) {
	this.where({
		$or: [
			{ expiresAt: null },
			{ expiresAt: { $gt: new Date() } },
		],
	});
	next();
});

// Pre-remove middleware: (Optional) Clean up related analytics/logs if needed
urlSchema.pre("remove", async function (next) {
	console.log(
		`Cleaning up analytics for deleted URL: ${this.shortId}`
	);
	next();
});

const URL = mongoose.model("Url", urlSchema);

module.exports = URL;
