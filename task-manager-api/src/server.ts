import { app } from './setup/app.js';
import { env } from './setup/env.js';

const port = env.PORT;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 API running on http://localhost:${port}`);
});
