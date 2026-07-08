import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletterSubscriber extends Document {
  email: string;
  subscribedAt: Date;
  isActive: boolean;
  unsubscribeToken?: string;
  unsubscribedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

const NewsletterSubscriberSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  unsubscribeToken: {
    type: String,
    default: null,
  },
  unsubscribedAt: {
    type: Date,
    default: null,
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
});

// Create compound index for efficient queries
NewsletterSubscriberSchema.index({ email: 1, isActive: 1 });

// Prevent duplicate subscriptions
NewsletterSubscriberSchema.pre('save', async function() {
  const existing = await mongoose.models.NewsletterSubscriber?.findOne({ 
    email: this.email,
    isActive: true 
  });
  
  if (existing && this.isNew) {
    throw new Error('Email already subscribed to newsletter');
  }
});

export default mongoose.models.NewsletterSubscriber || 
  mongoose.model<INewsletterSubscriber>('NewsletterSubscriber', NewsletterSubscriberSchema);