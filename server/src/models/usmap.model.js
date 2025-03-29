const mongoose = require('mongoose');

// Define controller reference schema
const controllerReferenceSchema = new mongoose.Schema({
  controllerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Controller',
    required: true
  },
  controllerType: {
    type: String, 
    enum: ['Tax Sale', 'Map', 'Property', 'Demographics'],
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  lastRun: Date,
  nextScheduledRun: Date,
  configuration: mongoose.Schema.Types.Mixed
}, { _id: false });

const usMapSchema = new mongoose.Schema({
  name: { type: String, default: "US Map" },
  type: { type: String, default: "us_map" },
  metadata: {
    totalStates: { type: Number, default: 0 },
    totalCounties: { type: Number, default: 0 },
    totalProperties: { type: Number, default: 0 },
    statistics: {
      totalTaxLiens: { type: Number, default: 0 },
      totalValue: { type: Number, default: 0 }
    }
  },
  controllers: [controllerReferenceSchema],
  states: [{ type: mongoose.Schema.Types.ObjectId, ref: 'State' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Ensure we're using the correct collection name
const USMap = mongoose.model('USMap', usMapSchema, 'usmap');

module.exports = USMap; 