import { GraphQLNonNull,  GraphQLObjectType, GraphQLString } from 'graphql'
import { FastifyInstance } from 'fastify';
import { User, CreateUserInput, UpdateUserInput } from '../types/user';
import { CreatePostInput, Post, UpdatePostInput } from '../types/post';
import { CreateProfileInput, Profile, UpdateProfileInput } from '../types/profiles';
import { MemberType, UpdateMemberTypeInput } from '../types/memberTypes';

const getMutation = async (fastify: FastifyInstance): Promise<GraphQLObjectType> => new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: User,
      args: {
        input: {
          type: new GraphQLNonNull(CreateUserInput),
        },
      },
      resolve: async (source, args) => await fastify.db.users.create(args.input)
    },
    updateUser: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        input: {
          type: new GraphQLNonNull(UpdateUserInput),
        },
      },
      resolve: async (source, args) => await fastify.db.users.change(args.id, args.input)
    },
    createPost: {
      type: Post,
      args: {
        input: {
          type: new GraphQLNonNull(CreatePostInput),
        },
      },
      resolve: async (source, args) => await fastify.db.posts.create(args.input)
    },
    updatePost: {
      type: Post,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        input: {
          type: new GraphQLNonNull(UpdatePostInput),
        },
      },
      resolve: async (source, args) => await fastify.db.posts.change(args.id, args.input)
    },
    createProfile: {
      type: Profile,
      args: {
        input: {
          type: new GraphQLNonNull(CreateProfileInput),
        },
      },
      resolve: async (source, args) => await fastify.db.profiles.create(args.input)
    },
    updateProfile: {
      type: Profile,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        input: {
          type: new GraphQLNonNull(UpdateProfileInput),
        },
      },
      resolve: async (source, args) => await fastify.db.profiles.change(args.id, args.input)
    },
    updateMemberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        input: {
          type: new GraphQLNonNull(UpdateMemberTypeInput),
        },
      },
      resolve: async (source, args) => await fastify.db.memberTypes.change(args.id, args.input)
    },
    subscribeToUser: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        subscribeToUserId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, args) => {
        const subscribeUser = await fastify.db.users.findOne({key: "id", equals: args.subscribeToUserId});
        if (!subscribeUser)
          throw fastify.httpErrors.notFound('User not found');

        const user = await fastify.db.users.findOne({key: "id", equals: args.id});
        if (!user)
          throw fastify.httpErrors.badRequest('invalid data');

        return await fastify.db.users.change(user.id, {
          subscribedToUserIds: [...user.subscribedToUserIds, subscribeUser.id]
        });
      }
    },
    unsubscribeFromUser: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        unsubscribeFromUserId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, args) => {
        const unsubscribeUser = await fastify.db.users.findOne({key: "id", equals: args.unsubscribeFromUserId});
        if (!unsubscribeUser)
          throw fastify.httpErrors.notFound('User not found');

        const user = await fastify.db.users.findOne({key: "id", equals: args.id});
        if (!user)
          throw fastify.httpErrors.badRequest('Incorrect data');

        if (!user.subscribedToUserIds.includes(unsubscribeUser.id))
          throw fastify.httpErrors.badRequest('Incorrect data');


        return await fastify.db.users.change(user.id, {
          subscribedToUserIds: user.subscribedToUserIds.filter( (elem) => elem != unsubscribeUser.id)
        });
      }
    },
  }
})

export default getMutation;