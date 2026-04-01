ApplicantSchema.pre('save', async function (next) {
  if (!this.isNew) return next(); // Only run for new applications

  const applicant = this;
   
  // 1. Get Company Initials (e.g., "Google" -> "GOO")
  const company = await mongoose.model("Authority").findById(applicant.companyId);
  const initials = company.companyName.substring(0, 3).toUpperCase();

  // 2. Define the Unique Counter Key for this specific Company
  const counterKey = `${initials}-FFW-SEQ`;

  // 3. Atomically increment and get the new number
  // findOneAndUpdate is ATOMIC - no two users can get the same number
  const counter = await Counter.findOneAndUpdate(
    { id: counterKey },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  // 4. Format the number with leading zeros (e.g., 5 -> "005")
  const sequenceNumber = counter.seq.toString().padStart(3, '0');

  // 5. Assign the Human-Readable Tracking ID
  applicant.applicationTrackingId = `${initials}-FFW-${sequenceNumber}`;

  next();
});