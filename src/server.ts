import { App } from '@/app';
import { AuthResolver } from '@resolvers/auth.resolver';
import { UserResolver } from '@resolvers/users.resolver';

import { ValidateEnv } from '@utils/validateEnv';
import { ProfileResolver } from './resolvers/profile.resolver';

ValidateEnv();

const app = new App([AuthResolver, UserResolver, ProfileResolver]);

app.listen();
