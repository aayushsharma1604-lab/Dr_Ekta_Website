/**
 * HomepageConfig model - Singleton for manually featured/pinned homepage items
 * Controls which content appears in featured sections
 */
const mongoose = require('mongoose');

const homepageConfigSchema = new mongoose.Schema({
  featuredTreatments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatment'
  }],
  featuredArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  featuredVideos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }],
  featuredTestimonials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Testimonial'
  }]
}, {
  timestamps: true
});

/**
 * Get the singleton config (creates if not exists)
 * @returns {Promise<HomepageConfig>}
 */
homepageConfigSchema.statics.getSingleton = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

/**
 * Update the singleton config
 * @param {Object} data - Config data to update
 * @returns {Promise<HomepageConfig>}
 */
homepageConfigSchema.statics.updateSingleton = async function(data) {
  const config = await this.getSingleton();
  
  const allowedFields = [
    'featuredTreatments', 'featuredArticles', 
    'featuredVideos', 'featuredTestimonials'
  ];
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      config[field] = data[field];
    }
  }
  
  return config.save();
};

module.exports = mongoose.model('HomepageConfig', homepageConfigSchema);