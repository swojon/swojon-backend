import { App } from '@/app';
import { AuthResolver } from '@resolvers/auth.resolver';
import { UserResolver } from '@resolvers/users.resolver';

import { ValidateEnv } from '@utils/validateEnv';
import { ProfileResolver } from './resolvers/profile.resolver';
import { RoleResolver } from './resolvers/role.resolver';

ValidateEnv();

const app = new App([
  AuthResolver, UserResolver, ProfileResolver, RoleResolver
]);

app.listen();
