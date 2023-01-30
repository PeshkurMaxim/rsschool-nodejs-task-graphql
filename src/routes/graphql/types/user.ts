import { FastifyInstance } from 'fastify';
import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLOutputType, GraphQLString } from 'graphql'
import { UserEntity } from '../../../utils/DB/entities/DBUsers';
import { MemberType } from './memberTypes';
import { Post } from './post';
import { Profile } from './profiles';

export const User: GraphQLOutputType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLString) },
    profile: {
      type: Profile,
      resolve: async (user: UserEntity, args: [], fastify: FastifyInstance) => await fastify.db.profiles.findOne({
        key: 'userId',
        equals: user.id,
      }),
    },
    posts: {
      type: new GraphQLList(Post),
      resolve: async (user: UserEntity, args: [], fastify: FastifyInstance) => await fastify.db.posts.findMany({
        key: 'userId',
        equals: user.id,
      }),
    },
    memberType: {
      type: MemberType,
      resolve: async (user: UserEntity, args: [], fastify: FastifyInstance) => {
        const userProfile = await fastify.db.profiles.findOne({ key: 'userId', equals: user.id });

        if (userProfile === null) {
          return null;
        }

        return fastify.db.memberTypes.findOne({ key: 'id', equals: userProfile.memberTypeId });
      },
    },
    subscribedToUser: {
      type: new GraphQLList(User),
      resolve: async (user: UserEntity, args: [], fastify: FastifyInstance) => await fastify.db.users.findMany({
        key: 'subscribedToUserIds',
        inArray: user.id,
      }),
    },
    userSubscribedTo: {
      type: new GraphQLList(User),
      resolve: async (user: UserEntity, args: [], fastify: FastifyInstance) => await fastify.db.users.findMany({
        key: 'id',
        equalsAnyOf: user.subscribedToUserIds,
      }),
    },
  })
})

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
  },
}); 

export const UpdateUserInput = new GraphQLInputObjectType({
  name: 'UpdateUserInput',
  fields: {
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
  },
});