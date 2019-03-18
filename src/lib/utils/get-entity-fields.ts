import { Bathingspot } from './../../orm/entity/Bathingspot';
import { getConnection } from 'typeorm';
import { enitiyFileds, IFilteredEntityPropsResoponse } from '../types-interfaces';
import { User } from '../../orm/entity/User';

export const getEntityFields: enitiyFileds = async (type) => {
  let propertyNames;
  let propertyTypeList;
  let notAllowedProps:string[];
  let filteredPropNames: string[] =[];

  if (type === 'Bathingspot') {
    propertyNames = await getConnection().getMetadata(Bathingspot).ownColumns.map(column => column.propertyName);
    propertyTypeList = await getConnection().getMetadata(Bathingspot).ownColumns.map(column => [column.propertyName, column.type]);
    notAllowedProps = ['id', 'user', 'region']
  }
  if (type === 'User') {
    propertyNames = await getConnection().getMetadata(User).ownColumns.map(column => column.propertyName);
    propertyTypeList = await getConnection().getMetadata(User).ownColumns.map(column => [column.propertyName, column.type]);
    notAllowedProps = ['id', 'protected', 'role', 'region']
  }

  if (propertyTypeList !== undefined && propertyNames !== undefined) {
    const lookupMap = new Map();
    propertyTypeList.forEach(ele => {
      lookupMap.set(ele[0], ele[1]);
    });
    filteredPropNames = propertyNames.filter(ele => notAllowedProps.includes(ele) !== true);
  }
  const res: IFilteredEntityPropsResoponse = {
    props: filteredPropNames
  };
  return res;
}
