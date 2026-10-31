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
    },

    priority: {
      type: String,
      enum: PRIORITIES,
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

    label: {
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

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;
