import mongoose, { Schema, model, models } from "mongoose";

export interface IAnalyticsEvent {
  _id?: mongoose.Types.ObjectId;
  event: string;        // e.g. "page_view", "cta_click", "modal_open", "modal_close"
  page: string;         // e.g. "/"
  label?: string;       // e.g. "try_now", "start_creating", "explore_tools"
  userAgent?: string;
  ip?: string;
  createdAt?: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    event: { type: String, required: true, index: true },
    page:  { type: String, required: true, index: true },
    label: { type: String },
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);

// TTL index — auto-delete events older than 90 days to keep DB lean
AnalyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

if (mongoose.models.AnalyticsEvent) {
  delete mongoose.models.AnalyticsEvent;
}

export const AnalyticsEvent = model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);
