import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createServer } from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/user';
import { ChatResolver } from './resolvers/chat';
import { AppDataSource } from './type-orm.config';
import { User } from './entities/User';

const graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.js');

const main = async () => {
  //type-orm
  await AppDataSource.initialize().then(() => {
    console.log(`🚀  Database ready`);
  })

  const schema = await buildSchema({
    resolvers: [
      UserResolver,
      ChatResolver
    ],
    validate: false,
  })

  // Create an Express app and HTTP server; we will attach both the WebSocket
  // server and the ApolloServer to this HTTP server.
  const app = express();
  const httpServer = createServer(app);


  // Create our WebSocket server using the HTTP server we just set up.
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });
  // Save the returned server's info so we can shut down this server later
  const serverCleanup = useServer({
    schema,
    onConnect: async (ctx) => {
      if (ctx.connectionParams) {
        const session = ctx.connectionParams.authorization as string;

        const user = await User.findOne({ where: { activeSessionToken: session } });
        if (!user) {
          throw new Error("Not Authenticated")
        }
      }
    },
    context: async (ctx) => {
      // This will be run every time the client sends a subscription request
      if (ctx.connectionParams) {
        return await ctx.connectionParams.authorization;
      }
      return null;
    },

  }, wsServer);

  const apolloServer = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: "bounded",
    context: ({ req, res }) => ({ req, res }),
   
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }) as ApolloServerPlugin,

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
      // ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });

  await apolloServer.start();

  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

  apolloServer.applyMiddleware({
    app,
  });

  const PORT = 4000;
  // Now that our HTTP server is fully set up, we can listen to it.
  httpServer.listen(PORT, () => {
    console.log(`🚀  Server is now running`);
  });

}

main().catch((error) => {
  console.error(error);
});