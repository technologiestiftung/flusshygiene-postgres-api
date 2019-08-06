jest.useFakeTimers();
import express, { Application } from 'express';
import 'reflect-metadata';
import request from 'supertest';
import { Connection } from 'typeorm';
import routes from '../../../src/lib/routes';
import { DefaultRegions, HttpCodes } from '../../../src/lib/common';
import path from 'path';
import {
  closeTestingConnections,
  createTestingConnections,
  reloadTestingDatabases,
  readTokenFromDisc,
} from '../../test-utils';

// ███████╗███████╗████████╗██╗   ██╗██████╗
// ██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗
// ███████╗█████╗     ██║   ██║   ██║██████╔╝
// ╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝
// ███████║███████╗   ██║   ╚██████╔╝██║
// ╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝

const token = readTokenFromDisc(
  path.resolve(__dirname, '../../.test.token.json'),
);
const headers = {
  authorization: `${token.token_type} ${token.access_token}`,
  Accept: 'application/json',
};

describe('testing bathingspots collection', () => {
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

  test('route get users bathingspots collection rains', async (done) => {
    const res = await request(app)
      .get('/api/v1/users/1/bathingspots/1/rains')
      .set(headers);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.success).toBe(true);
    done();
  });

  test('route POST users bathingspots collection rains', async (done) => {
    const obj = {
      value: Math.random() * 10,
      dateTime: '12:00:01',
      date: '2019-12-31',
      comment: 'This is a test',
    };
    const res = await request(app)
      .post('/api/v1/users/1/bathingspots/1/rains')
      .send(obj)
      .set(headers);
    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].comment).toBe(obj.comment);
    done();
  });
  test('route DELETE users bathingspots collection rains', async (done) => {
    const obj = {
      value: Math.random() * 10,
      dateTime: '12:00:01',
      date: '2019-12-31',
      comment: 'This is a test',
    };
    const resPost = await request(app)
      .post('/api/v1/users/1/bathingspots/1/rains')
      .send(obj)
      .set(headers);
    const res = await request(app)
      .delete(`/api/v1/users/1/bathingspots/1/rains/${resPost.body.data[0].id}`)
      .set(headers);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].comment).toBe(obj.comment);
    done();
  });
  test('route POST users bathingspots collection genericInputs measurements', async (done) => {
    const obj = {
      value: Math.random() * 10,
      dateTime: '12:00:01',
      date: '2019-12-31',
      comment: 'This is a test',
    };
    await request(app)
      .post('/api/v1/users/1/bathingspots/1/genericInputs/')
      .send({ name: 'foo' })
      .set(headers);
    // console.log(resg.body);
    const res = await request(app)
      .post('/api/v1/users/1/bathingspots/1/genericInputs/1/measurements')
      .send(obj)
      .set(headers);
    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].comment).toBe(obj.comment);
    done();
  });
});
