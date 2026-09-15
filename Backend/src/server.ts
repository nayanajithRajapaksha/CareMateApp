import dotenv from 'dotenv';

// Load environment variables before importing app
dotenv.config();

import app from './app';
import { ensureSchedulingSchema } from './config/schedulingSchema';

const PORT = process.env.PORT || 3000;

ensureSchedulingSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`CareMate Custom Authentication Backend running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize scheduling tables:', error);
    process.exit(1);
  });
