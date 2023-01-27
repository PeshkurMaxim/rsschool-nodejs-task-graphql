import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    return fastify.db.users.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;
      const user = await fastify.db.users.findOne({ key: "id", equals: id });

      if (user == null)
        throw fastify.httpErrors.notFound("invalid id");
      
      return user;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        return fastify.db.users.create(request.body);
      } catch (error) {
        throw fastify.httpErrors.badRequest("create error");
      }
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        return fastify.db.users.delete(request.params.id);
      } catch (error) {
        throw fastify.httpErrors.badRequest("delete error");
      }
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const subscribeUser = await fastify.db.users.findOne(request.params.id);
      if (!subscribeUser)
        throw fastify.httpErrors.notFound('User not found');

      const user = await fastify.db.users.findOne(request.body.userId);
      if (!user)
        throw fastify.httpErrors.badRequest('Incorrect data');

      return fastify.db.users.change(user.id, {
        subscribedToUserIds: [...user.subscribedToUserIds, subscribeUser.id]
      });

    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const unsubscribeUser = await fastify.db.users.findOne(request.params.id);
      if (!unsubscribeUser)
        throw fastify.httpErrors.notFound('User not found');

      const user = await fastify.db.users.findOne(request.body.userId);
      if (!user)
        throw fastify.httpErrors.badRequest('Incorrect data');

      return fastify.db.users.change(user.id, {
        subscribedToUserIds: user.subscribedToUserIds.filter( (elem) => elem != unsubscribeUser.id)
      });
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        return fastify.db.users.change(request.params.id, request.body);
      } catch (error) {
        throw fastify.httpErrors.badRequest("edit error");
      }
    }
  );
};

export default plugin;
