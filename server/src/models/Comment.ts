import { Schema, model, type InferSchemaType } from "mongoose";

const commentSchema = new Schema(
  {
    issue: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 5000,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

commentSchema.index({ issue: 1, createdAt: 1 });
export type Comment = InferSchemaType<typeof commentSchema>;

export const CommentModel = model("Comment", commentSchema);
