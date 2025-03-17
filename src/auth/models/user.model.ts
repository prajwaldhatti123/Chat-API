import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  validateEmail,
  validatePhoneNumber,
  validateBirthday,
  validateIpAddress,
} from '../validators/auth.validator.functions';

@Schema({ 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;  // Always remove password from responses
      return ret;
    }
  }
})
export class UserProfile {
  @Prop({
    type: String,
    required: true,
    unique: true,
    alias: 'userId'  // Allows using both _id and userId in code
  })
  _id: string;  // Will store user_001 format

  @Prop({
    required: true,
    unique: true,
    validate: {
      validator: validateEmail,
      message: 'Invalid email address format',
    }
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ 
    required: true,
    unique: true 
  })
  username: string;  // Changed from 'name'

  @Prop()
  avatarUrl?: string;  // Renamed from profile_pic

  @Prop({ 
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  })
  status: string;  // Online status

  @Prop()
  lastSeen?: Date;

  @Prop()
  bio?: string;

  // Keep existing auth-related fields
  @Prop({
    validate: {
      validator: validatePhoneNumber,
      message: 'Phone number must be 10-15 digits',
    }
  })
  phone_number?: string;

  @Prop({
    validate: {
      validator: validateBirthday,
      message: 'Birthday must be in YYYY-MM-DD format',
    }
  })
  birthday?: string;

  @Prop({
    enum: ['male', 'female', 'other', 'undisclosed'],
    default: 'undisclosed'
  })
  gender?: string;

  @Prop({ 
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  })
  accountStatus: string;  // Renamed from 'status'

  @Prop()
  last_login?: Date;

  @Prop([{
    timestamp: { type: Date, default: Date.now },
    ip: {
      type: String,
      validate: {
        validator: validateIpAddress,
        message: 'Invalid IP address format',
      }
    }
  }])
  login_history?: Array<{ timestamp: Date; ip: string }>;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

// Virtual for public profile data
UserProfileSchema.virtual('publicProfile').get(function() {
  return {
    userId: this._id,
    username: this.username,
    avatarUrl: this.avatarUrl,
    status: this.status,
    bio: this.bio,
    lastSeen: this.lastSeen
  };
});

// Indexes for common queries
UserProfileSchema.index({ status: 1, lastSeen: -1 });  // For presence tracking
UserProfileSchema.index({ username: 'text' });         // For search