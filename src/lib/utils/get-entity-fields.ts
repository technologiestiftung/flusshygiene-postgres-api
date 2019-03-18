import { getConnection } from 'typeorm';
import { entityFields, IFilteredEntityPropsResoponse } from '../types-interfaces';

const getPropertyNames = async (enititySchema: string)=>{
  return await getConnection().getMetadata(enititySchema).ownColumns.map(column => column.propertyName);

}

const getPropertTypeList = async (entitiySchema: string)=>{
  return await getConnection().getMetadata(entitiySchema).ownColumns.map(column => [column.propertyName, column.type]);
}

export const getEntityFields: entityFields = async (type) => {

  let propertyNames;
  let propertyTypeList;
  let notAllowedProps: string[];
  let filteredPropNames: string[] = [];
  try {
    propertyNames = await getPropertyNames(type); //await getConnection().getMetadata(Bathingspot).ownColumns.map(column => column.propertyName);
    propertyTypeList = await getPropertTypeList(type)//getConnection().getMetadata(Bathingspot).ownColumns.map(column => [column.propertyName, column.type]);
    switch(type){
      case 'Bathingspot':
      notAllowedProps = ['id', 'user', 'region'];
      break;
      case 'User':
      notAllowedProps = ['id', 'protected', 'role', 'region'];
      break;
      default:
      notAllowedProps = [];
    }
    // if (type === 'Bathingspot') {
    // }
    // if (type === 'User') {
    //   // propertyNames =  await getPropertyNames(type);// await getConnection().getMetadata(User).ownColumns.map(column => column.propertyName);
    //   // propertyTypeList = await getPropertTypeList(type); //await getConnection().getMetadata(User).ownColumns.map(column => [column.propertyName, column.type]);
    // }

    if (propertyTypeList !== undefined && propertyNames !== undefined) {
      // const lookupMap = new Map();
      // propertyTypeList.forEach(ele => {
      //   lookupMap.set(ele[0], ele[1]);
      // });
      filteredPropNames = propertyNames.filter(ele => notAllowedProps.includes(ele) !== true);
    }
  } catch (e) {
    throw e;
  }
  const res: IFilteredEntityPropsResoponse = {
    props: filteredPropNames
  };
  return res;
}
