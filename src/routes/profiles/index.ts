import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get(
    '/', 
    async function (request, reply): Promise<ProfileEntity[]> {
      return fastify.db.profiles.findMany();
    }
  );

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await fastify.db.profiles.findOne({ key: "id", equals: request.params.id });

      if (!profile)
        throw fastify.httpErrors.notFound('profile not found');

      return profile;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const user = await fastify.db.users.findOne({ key: "id", equals: request.body.userId });
      if (!user)
        throw fastify.httpErrors.badRequest("user not found");

      const profile = await fastify.db.profiles.findOne({ key: "userId", equals: request.body.userId });
      if (profile)
        throw fastify.httpErrors.badRequest('user already has a profile');

      const memberType = await fastify.db.memberTypes.findOne({ key: "id", equals: request.body.memberTypeId });
      if (!memberType)
        throw fastify.httpErrors.badRequest('Invalid memberType');

      return fastify.db.profiles.create(request.body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
        return await fastify.db.profiles.delete(request.params.id);
      } catch (error) {
        throw fastify.httpErrors.badRequest('invalid id');
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
        return await fastify.db.profiles.change(request.params.id, request.body);
      } catch (error) {
        throw fastify.httpErrors.badRequest('invalid data');
      }
    }
  );
};

export default plugin;
