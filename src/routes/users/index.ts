import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
// import { validate as uuidValidate } from 'uuid';

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
        return await fastify.db.users.create(request.body);
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
        const posts = await fastify.db.posts.findMany();
        posts.forEach(async (post) => {
          await fastify.db.posts.delete(post.id);
        })

        const profiles = await fastify.db.profiles.findMany();
        profiles.forEach(async (profile) => {
          await fastify.db.profiles.delete(profile.id);
        })

        const users = await fastify.db.users.findMany();
        users.forEach(async (user) => {
          if (user.subscribedToUserIds.includes(request.params.id)) {
            await fastify.db.users.change(user.id, {
              subscribedToUserIds: user.subscribedToUserIds.filter( (elem) => elem != request.params.id)
            });
          }
        })

        return await fastify.db.users.delete(request.params.id);
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
      const subscribeUser = await fastify.db.users.findOne({key: "id", equals: request.params.id});
      if (!subscribeUser)
        throw fastify.httpErrors.notFound('User not found');

      const user = await fastify.db.users.findOne({key: "id", equals: request.body.userId});
      if (!user)
        throw fastify.httpErrors.badRequest('invalid data');

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
      const unsubscribeUser = await fastify.db.users.findOne({key: "id", equals: request.params.id});
      if (!unsubscribeUser)
        throw fastify.httpErrors.notFound('User not found');

      const user = await fastify.db.users.findOne({key: "id", equals: request.body.userId});
      if (!user)
        throw fastify.httpErrors.badRequest('Incorrect data');

      if (!user.subscribedToUserIds.includes(unsubscribeUser.id))
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
      if (!request.params.id)
        throw fastify.httpErrors.badRequest("no valid id");

      try {
        return await fastify.db.users.change(request.params.id, request.body);
      } catch (error) {
        // if (uuidValidate(request.params.id))
        //   throw fastify.httpErrors.notFound("page not found");

        throw fastify.httpErrors.badRequest("no valid id");
      }
    }
  );
};

export default plugin;
