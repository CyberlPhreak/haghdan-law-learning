import type { ImageSourcePropType } from 'react-native';

import business from './art-business';
import clientSkills from './art-clientSkills';
import contractEthics from './art-contractEthics';
import criminal from './art-criminal';
import dispute from './art-dispute';
import estates from './art-estates';
import institutions from './art-institutions';
import property from './art-property';
import employment from './art-employment';
import flk1Public from './art-flk1-public';
import flk1Services from './art-flk1-services';
import flk1Tort from './art-flk1-tort';
import flk2Accounts from './art-flk2-accounts';
import flk2CriminalPractice from './art-flk2-criminal-practice';
import flk2Land from './art-flk2-land';
import flk2Trusts from './art-flk2-trusts';
import foundations from './art-foundations';
import housing from './art-housing';
import immigration from './art-immigration';
import police from './art-police';
import sqe2Advocacy from './art-sqe2-advocacy';
import sqe2Analysis from './art-sqe2-analysis';
import sqe2Drafting from './art-sqe2-drafting';
import sqe2Research from './art-sqe2-research';
import sqe2Writing from './art-sqe2-writing';

const pathwaySources: Record<string, ImageSourcePropType> = {
  'flk1-business': { uri: business },
  'flk1-dispute': { uri: dispute },
  'flk1-contract': { uri: contractEthics },
  'flk1-tort': { uri: flk1Tort },
  'flk1-system': { uri: institutions },
  'flk1-public': { uri: flk1Public },
  'flk1-services': { uri: flk1Services },
  'flk2-property': { uri: property },
  'flk2-wills': { uri: estates },
  'flk2-accounts': { uri: flk2Accounts },
  'flk2-land': { uri: flk2Land },
  'flk2-trusts': { uri: flk2Trusts },
  'flk2-crime': { uri: criminal },
  'flk2-criminal-practice': { uri: flk2CriminalPractice },
  'sqe2-interview': { uri: clientSkills },
  'sqe2-advocacy': { uri: sqe2Advocacy },
  'sqe2-analysis': { uri: sqe2Analysis },
  'sqe2-research': { uri: sqe2Research },
  'sqe2-writing': { uri: sqe2Writing },
  'sqe2-drafting': { uri: sqe2Drafting },
  foundations: { uri: foundations },
  housing: { uri: housing },
  employment: { uri: employment },
  immigration: { uri: immigration },
  police: { uri: police },
};

const fallbackSource: ImageSourcePropType = { uri: institutions };

export const subjectArtFor = (pathwayId: string): ImageSourcePropType =>
  pathwaySources[pathwayId] ?? fallbackSource;
