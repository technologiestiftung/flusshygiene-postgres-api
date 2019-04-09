import { readdir, readFile, statSync } from 'fs';
import { extname, resolve } from 'path';
import proj4 from 'proj4';
import { promisify } from 'util';
import { IObject } from '../../lib/types-interfaces';
import { createSpotWithValues } from '../../lib/utils/bathingspot-helpers';
import { createMeasurementWithValues } from '../../lib/utils/measurement-helpers';
import { Bathingspot } from '../entity/Bathingspot';
import { createPredictionWithValues } from './../../lib/utils/predictions-helpers';
import { BathingspotMeasurement } from './../entity/BathingspotMeasurement';
import { BathingspotPrediction } from './../entity/BathingspotPrediction';
// import {criteria} from '../../lib/utils/bathingspot-helpers';
const readFileAsync = promisify(readFile);

const readDirAsync = promisify(readdir);

const dataDirPath = resolve(__dirname, '../../../data');
proj4.defs([
  [
    'EPSG:4326',
    '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
  [
    'EPSG:25833',
    '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  ],
]);

const nameMappingPredictions: IObject = {
  badestellen_id: { type: 'number', mapsTo: 'oldId' },
  date: { type: 'date', mapsTo: 'date' },
  prediction: { type: 'string', mapsTo: 'prediction' },
};

const nameMappingMeasurements: IObject = {
  algen: { type: 'boolean', mapsTo: 'algen' }, /* might also be a number */
  algen_txt: { type: 'string', mapsTo: 'algenTxt' },
  badestellen_id: { type: 'number', mapsTo: 'detailId' },
  bsl: { type: 'string', mapsTo: 'bsl' },
  cb: { type: 'number', mapsTo: 'cb' },
  cb_txt: { type: 'string', mapsTo: 'cbTxt' },
  date: { type: 'date', mapsTo: 'date' },
  eco: { type: 'number', mapsTo: 'eco' },
  eco_txt: { type: 'string', mapsTo: 'ecoTxt' },
  ente: { type: 'number', mapsTo: 'ente' },
  ente_txt: { type: 'string', mapsTo: 'enteTxt' },
  id: { type: 'number', mapsTo: 'oldId' },
  sicht: { type: 'number', mapsTo: 'sicht' },
  sicht_txt: { type: 'string', mapsTo: 'sichtTxt' },
  state: { type: 'string', mapsTo: 'state' },
  temp: { type: 'number', mapsTo: 'temp' },
  temp_txt: { type: 'string', mapsTo: 'tempTxt' },
  wasserqualitaet: { type: 'boolean', mapsTo: 'wasserqualitaet' },
  wasserqualitaet_txt: { type: 'boolean', mapsTo: 'wasserqualitaetTxt' },
};

const nameMappingSpots: IObject = {
  barrierefrei: { type: 'boolean', mapsTo: 'disabilityAccess' },
  barrierefrei_wc: { type: 'boolean', mapsTo: 'disabilityAccessBathrooms' },
  barrierefrei_zugang: { type: 'boolean', mapsTo: 'hasDisabilityAccesableEntrence' },
  bezirk: { type: 'string', mapsTo: 'district' },
  cyano_moeglich: { type: 'boolean', mapsTo: 'cyanoPossible' },
  detail_id: { type: 'number', mapsTo: 'detailId' },
  gesundheitsamt_mail: { type: 'string', mapsTo: 'healthDepartmentMail' },
  gesundheitsamt_name: { type: 'string', mapsTo: 'healthDepartment' },
  gesundheitsamt_plz: { type: 'string', mapsTo: 'healthDepartmentPostalCode' },
  gesundheitsamt_stadt: { type: 'string', mapsTo: 'healthDepartmentCity' },
  gesundheitsamt_strasse: { type: 'string', mapsTo: 'healthDepartmentStreet' },
  gesundheitsamt_telefon: { type: 'string', mapsTo: 'healthDepartmentPhone' },
  gesundheitsamt_zusatz: { type: 'string', mapsTo: 'healthDepartmentAddition' },
  gewaesser: { type: 'string', mapsTo: 'water' },
  hundeverbot: { type: 'boolean', mapsTo: 'dogban' },
  id: { type: 'number', mapsTo: 'oldId' },
  image: { type: 'string', mapsTo: 'image' },
  imbiss: { type: 'boolean', mapsTo: 'snack' },
  latitude: { type: 'number', mapsTo: 'latitude' },
  letzte_eu_einstufung: { type: 'string', mapsTo: 'lastClassification' },
  longitude: { type: 'number', mapsTo: 'longitude' },
  messstelle: { type: 'string', mapsTo: 'measuringPoint' },
  name: { type: 'string', mapsTo: 'name' },
  name_lang: { type: 'string', mapsTo: 'nameLong' },
  name_lang2: { type: 'string', mapsTo: 'nameLong2' },
  parken: { type: 'boolean', mapsTo: 'parkingSpots' },
  plz: { type: 'string', mapsTo: 'postalCode' },
  prediction: { type: 'boolean', mapsTo: 'hasPrediction' },
  restaurant: { type: 'boolean', mapsTo: 'restaurant' },
  rettungsschwimmer: { type: 'boolean', mapsTo: 'lifeguard' },
  stadt: { type: 'string', mapsTo: 'city' },
  strasse: { type: 'string', mapsTo: 'street' },
  wasserrettung_durch_hilfsorganisationen_dlrg_oder_asb: { type: 'boolean', mapsTo: 'waterRescueThroughDLRGorASB' },
  wc: { type: 'boolean', mapsTo: 'bathrooms' },
  wc_mobil: { type: 'boolean', mapsTo: 'bathroomsMobile' },
  webseite: { type: 'string', mapsTo: 'website' },
};

interface ILatestfileOptions {
  extension: string;
  prefix: string;
  dataDirPath: string;
}
const getLatestFile: (opts: ILatestfileOptions) => Promise<string | undefined> = async (opts) => {
  try {
    // const filePath: string = '';
    const files = await readDirAsync(opts.dataDirPath, 'utf8');
    const filteredFiles = files.filter(file => extname(file) === opts.extension)
      .filter(file => file.indexOf(opts.prefix) !== -1)
      .map((fn) => {
        return {
          name: fn,
          time: statSync(`${opts.dataDirPath}/${fn}`).mtime.getTime(),
        };
      }).sort((a, b) => {
        return a.time - b.time;
      });
    if (filteredFiles.length === 0) {
      return undefined;
    } else {
      const fileName = filteredFiles[filteredFiles.length - 1].name;
      return `${opts.dataDirPath}/${fileName}`;
    }
  } catch (error) {
    throw error;
  }
};

const mapObjects: (mappingObj: IObject, obj: IObject) => IObject = (mappingObj, obj) => {
  const keys: string[] = Object.keys(obj);
  const resItem: IObject = {};
  keys.forEach((key: string) => {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] !== null && obj[key] !== undefined) {

        if (mappingObj.hasOwnProperty(key)) {
          if (mappingObj[key].type === 'number' && typeof obj[key] !== 'number') {

            console.log(key);
            console.log(obj.name);
            console.log('gotcha');
          }
          switch (mappingObj[key].type) {
            case 'string':
              resItem[mappingObj[key].mapsTo] = obj[key];
              break;
            case 'boolean':
              if (typeof obj[key] === 'boolean') {
                resItem[mappingObj[key].mapsTo] = obj[key];
              } else if (typeof obj[key] === 'number') {
                switch (obj[key]) {
                  case 1:
                    resItem[mappingObj[key].mapsTo] = true;
                    break;
                  case 0:
                    resItem[mappingObj[key].mapsTo] = false;
                    break;
                }
              }
              break;
            case 'number':
              resItem[mappingObj[key].mapsTo] = obj[key];
              break;
            case 'date':
              resItem[mappingObj[key].mapsTo] = new Date(obj[key]);
              break;
          }
        }
      }
    }
  });
  return resItem;
};

export const createPredictions: () => Promise<BathingspotPrediction[]> = async () => {
  try {
    const opts: ILatestfileOptions = {
      dataDirPath,
      extension: '.json',
      prefix: 'predictions',
    };
    const predictionsJsonPath = await getLatestFile(opts);
    if (predictionsJsonPath === undefined) {
      throw new Error(`Can not find measurement-[TIMESTAMP].json
  generated from manual export of sqlite3.db
  of badestellen/data-server app`);
    }
    const jsonString = await readFileAsync(predictionsJsonPath, 'utf8');
    const data = JSON.parse(jsonString);
    const res: IObject[] = [];
    data.forEach((datum: IObject) => {
      const predictionsObj = mapObjects(nameMappingPredictions, datum);
      res.push(predictionsObj);
    });
    const predictions: BathingspotPrediction[] = [];
    for (const obj of res) {
      const prediction = await createPredictionWithValues(obj);
      predictions.push(prediction);
    }
    return predictions;
  } catch (error) {
    throw error;
  }
};
export const createMeasurements: () => Promise<BathingspotMeasurement[]> = async () => {
  try {

    const opts: ILatestfileOptions = {
      dataDirPath,
      extension: '.json',
      prefix: 'measurements',
    };
    const measurementsJsonPath = await getLatestFile(opts);
    if (measurementsJsonPath === undefined) {
      throw new Error(
        `Can not find measurement-[TIMESTAMP].json
          generated from manual export of sqlite3.db
          of badestellen/data-server app`,
      );
    }
    const jsonString = await readFileAsync(measurementsJsonPath, 'utf8');
    const data = JSON.parse(jsonString);
    // clean the data
    const res: any[] = [];
    data.forEach((datum: IObject) => {
      // if (datum.hasOwnProperty('id')) {
      //   delete datum.id;
      // }

      const measurementObj = mapObjects(nameMappingMeasurements, datum);
      res.push(measurementObj);
    });
    const measurements: BathingspotMeasurement[] = [];
    for (const obj of res) {
      const measurement = await createMeasurementWithValues(obj);
      measurements.push(measurement);
    }
    return measurements;
  } catch (error) {
    throw error;
  }
};
export const createSpots: () => Promise<Bathingspot[]> = async () => {
  try {

    const opts: ILatestfileOptions = {
      dataDirPath,
      extension: '.json',
      prefix: 'bathingspots',
    };
    const spotsJsonPath = await getLatestFile(opts);
    if (spotsJsonPath === undefined) {
      throw new Error(
        `Can not find bathingspots-[TIMESTAMP].json
          generated from manual export of sqlite3.db
          of badestellen/data-server app`,
      );
    }
    const jsonString = await readFileAsync(spotsJsonPath, 'utf8');

    const data = JSON.parse(jsonString);
    const res: any[] = [];

    // clean the BathingspotRawModelData

    data.forEach((datum: any, i: number, arr: any[]) => {
      // const spot: IObject = {};
      // if (datum.hasOwnProperty('id')) {
      //   delete arr[i].id;
      // }
      if (datum.hasOwnProperty('ost') && datum.hasOwnProperty('nord')) {
        try {
          const coord = proj4('EPSG:25833', 'EPSG:4326', [datum.ost, datum.nord]);
          arr[i].latitude = parseFloat(coord[1].toFixed(5));
          arr[i].longitude = parseFloat(coord[0].toFixed(5));
        } catch (err) {
          console.log('err', err);
        }
      }
      const spot = mapObjects(nameMappingSpots, datum);
      // const keys: string[] = Object.keys(datum);
      // keys.forEach((key: string) => {
      //   if (datum.hasOwnProperty(key)) {
      //     if (nameMappingSpots.hasOwnProperty(key)) {
      //       switch (nameMappingSpots[key].type) {
      //         case 'string':
      //           spot[nameMappingSpots[key].mapsTo] = datum[key];
      //           break;
      //         case 'boolean':
      //           spot[nameMappingSpots[key].mapsTo] = datum[key];
      //           break;
      //         case 'number':
      //           spot[nameMappingSpots[key].mapsTo] = datum[key];
      //           break;
      //       }
      //     }
      //   }
      // });
      spot.isPublic = true;
      const geojson: IObject = {
        geometry:
          { type: 'Point', coordinates: [datum.longitude, datum.latitude] }, properties: { name: datum.name },
        type: 'Feature',
      };
      spot.location = geojson;
      res.push(spot);
    });

    const spots: Bathingspot[] = [];
    for (const item of res) {
      const spot = await createSpotWithValues(item);
      spots.push(spot);
    }
    return spots;

  } catch (error) {
    throw error;
  }
};

// const main = async () => {
//   createSpots();
// };
// main();
