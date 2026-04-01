import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true 
  }, // Format: "ABC-FFW-APPS" or "ABC-FFW-JOBS"
  seq: { 
    type: Number, 
    default: 0 
  }
});

const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);
export default Counter;