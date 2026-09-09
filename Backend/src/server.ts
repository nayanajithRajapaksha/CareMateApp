import dotenv from 'dotenv';

// Load environment variables before importing app
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`CareMate Custom Authentication Backend running on port ${PORT}`);
});
