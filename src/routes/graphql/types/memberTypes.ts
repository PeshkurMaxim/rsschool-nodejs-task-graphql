import { GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLOutputType, GraphQLString } from 'graphql'

export const MemberType: GraphQLOutputType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: GraphQLString },
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt }
  })
})

export const UpdateMemberTypeInput = new GraphQLInputObjectType({
    name: 'UpdateMemberTypeInput',
    fields: {
        discount: { type: new GraphQLNonNull(GraphQLInt) },
        monthPostsLimit: { type: new GraphQLNonNull(GraphQLInt) }
    },
  }); 