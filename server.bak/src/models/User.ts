import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['admin', 'agent', 'user'],
    default: 'user'
  },
  firstName: String,
  lastName: String,
  resetToken: String,
  resetTokenExpires: Date,
  settings: Schema.Types.Mixed
}, {
  timestamps: true
});

// Create indexes for efficient queries
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ resetToken: 1 });

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Password validation method
UserSchema.methods.validatePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export interface UserDocument extends Document {
  email: string;
  password: string;
  role: 'admin' | 'agent' | 'user';
  firstName?: string;
  lastName?: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  settings?: any;
  createdAt: Date;
  updatedAt: Date;
  validatePassword(password: string): Promise<boolean>;
}

export const User = mongoose.model<UserDocument>('User', UserSchema);

export default User; 