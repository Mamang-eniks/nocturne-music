const { Schema, model } = require("mongoose");

const trackSchema = new Schema(
  {
    title: String,
    url: String,
    duration: String,
    thumbnail: String,
    author: String,
  },
  { _id: false }
);

const playlistSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    tracks: { type: [trackSchema], default: [] },
  },
  { timestamps: true }
);

playlistSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = model("Playlist", playlistSchema);
