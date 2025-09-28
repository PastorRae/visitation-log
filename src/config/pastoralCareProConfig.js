// PastoralCare Pro Integration Configuration
// This file contains the configuration settings for connecting to the PastoralCare Pro API

export const PASTORAL_CARE_PRO_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: process.env.PASTORAL_CARE_PRO_API_URL || 'https://api.pastoralcarepro.com',
    VERSION: 'v1',
    TIMEOUT: 10000, // 10 seconds
  },

  // Authentication Configuration
  AUTH: {
    TOKEN_KEY: 'pastoral_care_pro_token',
    REFRESH_TOKEN_KEY: 'pastoral_care_pro_refresh_token',
    USER_KEY: 'pastoral_care_pro_user',
    ORGANIZATION_KEY: 'pastoral_care_pro_organization',
  },

  // Sync Configuration
  SYNC: {
    AUTO_SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000, // 2 seconds
    BATCH_SIZE: 50, // Max items per batch sync
  },

  // Data Mapping Configuration
  FIELD_MAPPING: {
    // Local field -> PastoralCare Pro field mapping
    VISIT_FIELDS: {
      id: 'id',
      visit_date: 'visit_date',
      pastor_email: 'pastor_email',
      pastor_name: 'pastor_name',
      church_id: 'church_id',
      member_id: 'member_id',
      member_first: 'member_first_name',
      member_last: 'member_last_name',
      visit_type: 'visit_type',
      category: 'category',
      comments: 'notes',
      address: 'location_address',
      lat: 'latitude',
      lng: 'longitude',
      start_time: 'start_time',
      end_time: 'end_time',
      scripture_refs: 'scripture_references',
      prayer_requests: 'prayer_requests',
      resources: 'resources_provided',
      next_visit_date: 'follow_up_date',
      followup_actions: 'follow_up_actions',
      priority: 'priority_level',
      created_at: 'created_at',
      updated_at: 'updated_at'
    },
    
    CHURCH_FIELDS: {
      id: 'id',
      name: 'name',
      district: 'district',
      conference: 'conference',
      pastor_name: 'pastor_name',
      pastor_email: 'pastor_email',
      address: 'address',
      phone: 'phone',
      active: 'active_status',
      created_at: 'created_at',
      updated_at: 'updated_at'
    },

    MEMBER_FIELDS: {
      id: 'id',
      first_name: 'first_name',
      last_name: 'last_name',
      church_id: 'church_id',
      email: 'email',
      phone: 'phone_number',
      address: 'home_address',
      affiliation: 'membership_type',
      discipleship_status: 'discipleship_level',
      join_date: 'membership_date',
      birth_date: 'birth_date',
      emergency_contact: 'emergency_contact',
      created_at: 'created_at',
      updated_at: 'updated_at'
    }
  },

  // Error Codes and Messages
  ERROR_CODES: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR'
  },

  ERROR_MESSAGES: {
    NETWORK_ERROR: 'No internet connection available',
    AUTH_ERROR: 'Authentication failed. Please check your credentials.',
    VALIDATION_ERROR: 'Invalid data format. Please check your inputs.',
    SERVER_ERROR: 'PastoralCare Pro server is temporarily unavailable',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    RATE_LIMIT_ERROR: 'Too many requests. Please wait and try again.'
  },

  // Default Values
  DEFAULTS: {
    VISIT_TYPE: 'in_person',
    CATEGORY: 'pastoral',
    PRIORITY: 'medium',
    AFFILIATION: 'member',
    DISCIPLESHIP_STATUS: 'active'
  },

  // Validation Rules
  VALIDATION: {
    REQUIRED_VISIT_FIELDS: [
      'visit_date',
      'pastor_email',
      'pastor_name',
      'church_id',
      'visit_type',
      'category'
    ],
    REQUIRED_CHURCH_FIELDS: [
      'name',
      'pastor_email'
    ],
    REQUIRED_MEMBER_FIELDS: [
      'first_name',
      'last_name',
      'church_id'
    ],
    MAX_COMMENT_LENGTH: 2000,
    MAX_ADDRESS_LENGTH: 200,
    MAX_NAME_LENGTH: 100
  },

  // Feature Flags
  FEATURES: {
    AUTO_SYNC: true,
    BACKGROUND_SYNC: true,
    OFFLINE_MODE: true,
    CONFLICT_RESOLUTION: true,
    BULK_OPERATIONS: true,
    REAL_TIME_UPDATES: false, // Future feature
    PHOTO_UPLOAD: false, // Future feature
    VOICE_NOTES: false // Future feature
  },

  // Cache Configuration
  CACHE: {
    CHURCHES_TTL: 24 * 60 * 60 * 1000, // 24 hours
    MEMBERS_TTL: 12 * 60 * 60 * 1000, // 12 hours
    SYNC_STATUS_TTL: 5 * 60 * 1000, // 5 minutes
    MAX_CACHE_SIZE: 10 * 1024 * 1024 // 10MB
  },

  // Conference-Specific Settings for East Caribbean Conference (Barbados)
  ECC_BARBADOS: {
    TIMEZONE: 'America/Barbados',
    CURRENCY: 'BBD',
    LANGUAGE: 'en',
    DATE_FORMAT: 'DD/MM/YYYY',
    TIME_FORMAT: '12h',
    
    // Regional Integration Settings
    WHATSAPP_INTEGRATION: true,
    SMS_FALLBACK: true,
    GOSPEL_CALENDAR_SYNC: true,
    
    // Barbados-Specific Categories
    CUSTOM_CATEGORIES: [
      'hurricane_response',
      'community_outreach',
      'youth_ministry',
      'elderly_care',
      'financial_counseling'
    ],

    // Contact Preferences
    PREFERRED_CONTACT_METHODS: [
      'whatsapp',
      'phone',
      'in_person',
      'sms'
    ]
  }
};

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...PASTORAL_CARE_PRO_CONFIG,
        API: {
          ...PASTORAL_CARE_PRO_CONFIG.API,
          BASE_URL: 'https://api.pastoralcarepro.com'
        },
        SYNC: {
          ...PASTORAL_CARE_PRO_CONFIG.SYNC,
          AUTO_SYNC_INTERVAL: 2 * 60 * 1000 // 2 minutes in production
        }
      };
      
    case 'staging':
      return {
        ...PASTORAL_CARE_PRO_CONFIG,
        API: {
          ...PASTORAL_CARE_PRO_CONFIG.API,
          BASE_URL: 'https://staging-api.pastoralcarepro.com'
        }
      };
      
    case 'development':
    default:
      return {
        ...PASTORAL_CARE_PRO_CONFIG,
        API: {
          ...PASTORAL_CARE_PRO_CONFIG.API,
          BASE_URL: 'http://localhost:3000' // Local development
        },
        SYNC: {
          ...PASTORAL_CARE_PRO_CONFIG.SYNC,
          AUTO_SYNC_INTERVAL: 10 * 60 * 1000 // 10 minutes in development
        }
      };
  }
};

// Helper functions for configuration access
export const getApiUrl = (endpoint = '') => {
  const config = getEnvironmentConfig();
  return `${config.API.BASE_URL}/api/${config.API.VERSION}${endpoint}`;
};

export const getFieldMapping = (entityType) => {
  const config = getEnvironmentConfig();
  switch (entityType.toUpperCase()) {
    case 'VISIT':
      return config.FIELD_MAPPING.VISIT_FIELDS;
    case 'CHURCH':
      return config.FIELD_MAPPING.CHURCH_FIELDS;
    case 'MEMBER':
      return config.FIELD_MAPPING.MEMBER_FIELDS;
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
};

export const validateRequiredFields = (data, entityType) => {
  const config = getEnvironmentConfig();
  let requiredFields = [];
  
  switch (entityType.toUpperCase()) {
    case 'VISIT':
      requiredFields = config.VALIDATION.REQUIRED_VISIT_FIELDS;
      break;
    case 'CHURCH':
      requiredFields = config.VALIDATION.REQUIRED_CHURCH_FIELDS;
      break;
    case 'MEMBER':
      requiredFields = config.VALIDATION.REQUIRED_MEMBER_FIELDS;
      break;
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }

  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  return true;
};

export default PASTORAL_CARE_PRO_CONFIG;