import mongoose from "mongoose";

import { ISSUE_TYPES, ISSUE_STATUSES, PRIORITIES } from "./constants.ts";

const issueSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },

    number: {
      type: Number,
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    type: {
      type: String,
      enum: ISSUE_TYPES,
      required: true,
    },

    status: {
      type: String,
      enum: ISSUE_STATUSES,
      required: true,
      default: "todo",
    },

    priority: {
      type: String,
      enum: PRIORITIES,
      required: true,
      default: "medium",
    },

    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    labels: {
      type: [String],
      default: [],
    },

    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    epicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      default: null,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  },
);

issueSchema.index({ project: 1, number: 1 }, { unique: true });

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;
