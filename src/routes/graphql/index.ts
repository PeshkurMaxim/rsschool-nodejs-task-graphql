import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import { ExecutionResult, graphql, GraphQLSchema, parse, validate } from 'graphql';
import * as depthLimit from 'graphql-depth-limit';
import getQuery from './helpers/getQuery';
import getMutation from './helpers/getMutation';


const DEPTH_LIMIT = 6;


const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const { query } = request.body;
      const schema = new GraphQLSchema({
        query: await getQuery(fastify),
        mutation: await getMutation(fastify),
      });

      const errors = validate(schema, parse(query!), [depthLimit(DEPTH_LIMIT)]);

      if (errors.length > 0) {
        const result: ExecutionResult = {
          errors: errors,
          data: null,
        };
        
        return result;
      }

      return graphql({
        schema,
        source: query!,
        contextValue: fastify,
      })
    }
  );
};

export default plugin;
