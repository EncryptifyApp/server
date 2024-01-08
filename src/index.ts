import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/user';
import { AppDataSource } from './type-orm.config';
import { MessageResolver } from './resolvers/message';



const main = async () => {
    //type-orm
    await AppDataSource.initialize().then(() => {
        console.log(`🚀  Database ready`);
    })

    const schema = await buildSchema({
        resolvers: [
            UserResolver,
            MessageResolver
        ],
        validate: false,
    })


    const server = new ApolloServer({
        schema,
    });

    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },
        context: async ({ req, res }) => ({req,res}),
    });

    console.log(`🚀  Server ready at: ${url}`);
}


main().catch((err) => {
    console.error(err);
});