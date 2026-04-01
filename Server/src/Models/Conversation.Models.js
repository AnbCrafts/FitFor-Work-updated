const conversationSchema = new mongoose.Schema({
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  lastMessage: {
    text: String,
    senderId: mongoose.Schema.Types.ObjectId,
    at: { type: Date, default: Date.now }
  },
  unreadCount: {
    type: Map,
    of: Number // Tracks unread count per user: { "userId1": 2, "userId2": 0 }
  },
  relatedJobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job"
  }
}, { timestamps: true });

conversationSchema.index({ participants: 1 });