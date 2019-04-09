import cors from 'cors';
import errorHandler from 'errorhandler';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { createConnection, getCustomRepository, getRepository } from 'typeorm';
import { Region } from '../orm/entity/Region';
import { User } from '../orm/entity/User';
import { createUser } from '../orm/fixtures/create-test-user';
import { createPredictions, createSpots } from '../orm/fixtures/import-existing-data';
import { Bathingspot } from './../orm/entity/Bathingspot';
import { createMeasurements } from './../orm/fixtures/import-existing-data';
import { BathingspotRepository } from './repositories/BathingspotRepository';
import routes from './routes';
import { DefaultRegions, UserRole } from './types-interfaces';

const app = express();
// let connection: Connection;
app.use(cors());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(helmet());
  app.use(morgan('tiny'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
  try {
    const connection = await createConnection();
    // const db = await connection.connect();
    // process.stdout.write(db.name);
    let databaseEmpty: boolean = true;
    const users = await getRepository(User).find();
    // process.stdout.write(`${users.length}\n`);
    if (users.length !== 0) {
      databaseEmpty = false;
    }

    // process.stdout.write(`Users ${JSON.stringify(users)}\n`);
    if (databaseEmpty === true && process.env.NODE_ENV === 'development') {
      // the first user we create is a special user
      // it is protected and cannot be deletet through the API easily
      // it is for stashing data of deleted users
      // because what should we do when we have to delete a user but maintain the bathingspots?
      await connection.manager.save(createUser());

      // generate some default data here
      const userCreator = new User();
      userCreator.firstName = 'James';
      userCreator.lastName = 'Bond';
      userCreator.role = UserRole.creator;
      userCreator.email = 'faker@fake.com';

      const userReporter = new User();
      userReporter.firstName = 'Karla';
      userReporter.lastName = 'Kolumna';
      userReporter.role = UserRole.reporter;
      userReporter.email = 'karla@bluemchen.dev';
      const spots = await createSpots();
      const spot = new Bathingspot();
      const regions: Region[] = [];
      for (const key in DefaultRegions) {
        if (DefaultRegions.hasOwnProperty(key)) {
          const r = new Region();
          r.name = key;
          r.displayName = key;
          regions.push(r);
        }
      }
      // const region = new Region();
      // region.name = Regions.berlinbrandenburg;
      spots.forEach(s => {
        s.region = regions[1];
      });
      spot.region = regions[0];
      spot.isPublic = true;
      spot.name = 'billabong';
      userCreator.regions = [regions[0], regions[1]];
      userReporter.regions = [regions[0]];
      userCreator.bathingspots = [spot, ...spots];

      await connection.manager.save(regions);
      await connection.manager.save(spot);
      await connection.manager.save(spots);
      await connection.manager.save([userCreator, userReporter]);
      // now update all the spots with createMeasurements
      const measurements = await createMeasurements();
      const spotRepo = getCustomRepository(BathingspotRepository);
      for (const m of measurements) {

        await connection.manager.save(m);

        const bspot = await spotRepo.findOne(
          { where: { detailId: m.detailId } });
        // console.log(bspot);
        if (bspot !== undefined) {
          if (bspot.measurements === undefined) {
            bspot.measurements = [m];

          } else {
            bspot.measurements.push(m);
          }
          await connection.manager.save(bspot);
        }
      }

      // now import the predictions
      const predictions = await createPredictions();
      for (const p of predictions) {
        await connection.manager.save(p);

        const bspot = await spotRepo.findOne({
          where: {
            oldId: p.oldId,
          },
        });
        if (bspot !== undefined) {
          if (bspot.predictions === undefined) {
            bspot.predictions = [p];
          } else {
            bspot.predictions.push(p);
          }
          await connection.manager.save(bspot);
        }
      }
    }
    if (databaseEmpty === true && process.env.NODE_ENV === 'production') {
      // uh oh we are in production
      const protectedUser = await getRepository(User).find({
        where: {
          protected: true,
        },
      });
      if (protectedUser === undefined) {
        // uh oh no protected user,
        const newProtectedUser = createUser();
        if (newProtectedUser !== undefined) {

          await connection.manager.save(newProtectedUser);
        } else {
          throw new Error('could not create protected user');
        }
      }
    }
  } catch (error) {
    throw error;
  }
  console.log('Done with setup');
})();

app.get('/', (request, response) => {
  response.send(`Server is running. You called ${request.url}`);
});

// app.use('/api/v1', async (err: Error, _req: Request, res: Response, next: NextFunction)=>{
//   const con = await getConnection();
//   if(con === undefined){
//     responder(res, HttpCodes.internalError, errorResponse(err));
//   }else{
//     next(err);
//   }
// });
app.use('/api/v1', routes);
// app.use('/api/v1', router);
if (process.env.NODE_ENV === 'development') {
  // In Express an error handler,
  // always has to be the last line before starting the server.
  app.use(errorHandler());
}

export = app;
