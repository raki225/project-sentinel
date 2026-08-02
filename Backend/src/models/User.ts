import { Schema, model, Document as MongooseDocument } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "super_admin" | "government" | "vendor" | "auditor" | "citizen" | "admin" | "analyst";

export interface IUser extends MongooseDocument {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  organization?: string;
  designation?: string;
  phone?: string;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["super_admin", "government", "vendor", "auditor", "citizen", "admin", "analyst"],
      default: "citizen",
    },
    department: { type: String },
    organization: { type: String },
    designation: { type: String },
    phone: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>("User", userSchema);
