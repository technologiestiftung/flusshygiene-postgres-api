jest.useFakeTimers();
import { getUserByIdWithSpots } from './../../src/lib/utils/user-repo-helpers';
import express, { Application } from 'express';
import 'reflect-metadata';
import { Connection } from 'typeorm';
import routes from '../../src/lib/routes';
import { DefaultRegions } from '../../src/lib/common';
import {
  closeTestingConnections,
  createTestingConnections,
  reloadTestingDatabases,
} from '../test-utils';
import { getRegionsList } from '../../src/lib/utils/region-repo-helpers';
// ███████╗███████╗████████╗██╗   ██╗██████╗
// ██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗
// ███████╗█████╗     ██║   ██║   ██║██████╔╝
// ╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝
// ███████║███████╗   ██║   ╚██████╔╝██║
// ╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝

describe('misc functions that need a DB', () => {
  let app: Application;
  let connections: Connection[];

  beforeAll(async (done) => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error(
        'We are not in the test env this is harmful tables will be dropped',
      );
    }
    connections = await createTestingConnections();
    done();
  });
  // beforeEach(async (done) => {
  //   try {
  //     await reloadTestingDatabases(connections);
  //     done();
  //   } catch (err) {
  //     console.warn(err.message);
  //   }
  // });
  afterAll(async (done) => {
    try {
      await reloadTestingDatabases(connections);
      await closeTestingConnections(connections);
      done();
    } catch (err) {
      console.warn(err.message);
      throw err;
    }
  });

  app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/v1/', routes);

  // ███████╗███████╗████████╗██╗   ██╗██████╗
  // ██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗
  // ███████╗█████╗     ██║   ██║   ██║██████╔╝
  // ╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝
  // ███████║███████╗   ██║   ╚██████╔╝██║
  // ╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝

  // ██████╗  ██████╗ ███╗   ██╗███████╗
  // ██╔══██╗██╔═══██╗████╗  ██║██╔════╝
  // ██║  ██║██║   ██║██╔██╗ ██║█████╗
  // ██║  ██║██║   ██║██║╚██╗██║██╔══╝
  // ██████╔╝╚██████╔╝██║ ╚████║███████╗
  // ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚══════╝
  describe('misc functions that need a DB', () => {
    test('should return a list of default regions', async (done) => {
      const list = await getRegionsList();
      for (const key in DefaultRegions) {
        if (DefaultRegions.hasOwnProperty(key)) {
          const element = DefaultRegions[key];
          expect(list.includes(element)).toBe(true);
        }
      }
      done();
    });
  });

  describe('testing errors on repo helpers', () => {
    it('should be catch error due to missing db', (done) => {
      getUserByIdWithSpots(10000)
        .then((res) => {
          expect(res).toBe(undefined);
          done();
        })
        .catch((err) => {
          expect(err.message).toEqual('Connection "default" was not found.');
          done();
        });
    });

    // it.skip('should be catch error due to missing db', (done) => {
    //   getBathingspotById(10000).then(res => {
    //     expect(res).toBe(undefined);
    //     done();
    //   }).catch(err => {
    //     expect(err.message).toEqual('Connection "default" was not found.');
    //     done();
    //   });
    // });

    // it('should be catch error due to missing db', (done) => {
    //   getSpotByUserAndId(10000, 10000).then(res => {
    //     expect(res).toBe(undefined);
    //     done();
    //   }).catch(err => {
    //     expect(err.message).toEqual('Connection "default" was not found.');
    //     done();
    //   });
    // });
  });
});
