import { UserRole } from '../../lib/types-interfaces';
import { User } from '../entity/User';

export const createProtectedUser = (): User => {
const protectedUser = new User();
protectedUser.firstName = 'Conan';
protectedUser.lastName = 'the Barbarian';
protectedUser.role = UserRole.admin;
protectedUser.email = 'moron-zirfas@technologiestiftung-berlin.de'; // for now
protectedUser.protected = true;
return protectedUser;
};

export const createReporterUser = (): User => {
  const reporter = new User();
  reporter.firstName = 'Shera';
  reporter.lastName = 'the Princess of Power';
  reporter.role = UserRole.reporter;
  reporter.email = 'moron-zirfas@technologiestiftung-berlin.de'; // for now
  reporter.protected = false;
  return reporter;
  };
