import { App } from '@/app';
import { AuthResolver } from '@resolvers/auth.resolver';
import { UserResolver } from '@resolvers/users.resolver';

import { ValidateEnv } from '@utils/validateEnv';
import { ProfileResolver } from './resolvers/profile.resolver';
import { RoleResolver } from './resolvers/role.resolver';
import { FollowResolver } from './resolvers/follow.resolver';
import { CommunityResolver } from './resolvers/community.resolver';
import { CommunityMemberResolver } from './resolvers/communityMember.resolver';
import { CategoryResolver } from './resolvers/category.resolver';
import { ChatResolver } from './resolvers/chat.resolver';

ValidateEnv();

const app = new App([
  AuthResolver, UserResolver, ProfileResolver, RoleResolver, FollowResolver,
  CommunityResolver, CommunityMemberResolver, CategoryResolver, ChatResolver
]);

app.listen();
