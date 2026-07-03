import mongoose, { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/* User account. Password is a bcrypt hash — never store plaintext. */
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: "Fraud Analyst", trim: true },
    company: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) || model<UserDoc>("User", UserSchema);
