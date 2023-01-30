import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { FastifyInstance } from 'fastify';
import { User } from '../types/user';
import { Post } from "../types/post";
import { Profile } from "../types/profiles";
import { MemberType } from "../types/memberTypes";


const getQuery = async (fastify: FastifyInstance): Promise<GraphQLObjectType> => new GraphQLObjectType({
  name: 'Query', 
  fields: {
    users: {
      type: new GraphQLList(User),
      resolve: async () => await fastify.db.users.findMany(),
    },
    user: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, args) => await fastify.db.users.findOne({ key: "id", equals: args.id })
    },
    posts: {
      type: new GraphQLList(Post),
      resolve: async () => await fastify.db.posts.findMany(),
    },
    post: {
      type: Post,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, args) => await fastify.db.posts.findOne({ key: "id", equals: args.id })
    },
    profiles: {
      type: new GraphQLList(Profile),
      resolve: async () => await fastify.db.profiles.findMany(),
    },
    profile: {
      type: Profile,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, args) => await fastify.db.profiles.findOne({ key: "id", equals: args.id })
    },
    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: async () => await fastify.db.memberTypes.findMany(),
    },
    memberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, args) => await fastify.db.memberTypes.findOne({ key: "id", equals: args.id })
    },
  }
})

export default getQuery;