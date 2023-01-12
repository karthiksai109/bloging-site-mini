const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    body: {
      type: String,
      required: true,
    },
    authorId: {
      type: ObjectId,
      ref: "Project1Author",
    },
    tags: [String],
    category: {
      type: String,
      required: true,
    },
    subcategory: [String],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    DeletedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project1Blog", BlogSchema);
