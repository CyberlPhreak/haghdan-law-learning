import type { ImageSourcePropType } from 'react-native';

import business from './art-business';
import clientSkills from './art-clientSkills';
import contractEthics from './art-contractEthics';
import criminal from './art-criminal';
import dispute from './art-dispute';
import estates from './art-estates';
import institutions from './art-institutions';
import property from './art-property';

const sources = {
  business: { uri: business },
  clientSkills: { uri: clientSkills },
  contractEthics: { uri: contractEthics },
  criminal: { uri: criminal },
  dispute: { uri: dispute },
  estates: { uri: estates },
  institutions: { uri: institutions },
  property: { uri: property },
} satisfies Record<string, ImageSourcePropType>;

type ArtFamily = keyof typeof sources;

const pathwayFamilies: Record<string, ArtFamily> = {
  'flk1-business': 'business',
  'flk1-dispute': 'dispute',
  'flk1-contract': 'contractEthics',
  'flk1-tort': 'dispute',
  'flk1-system': 'institutions',
  'flk1-public': 'institutions',
  'flk1-services': 'contractEthics',
  'flk2-property': 'property',
  'flk2-wills': 'estates',
  'flk2-accounts': 'estates',
  'flk2-land': 'property',
  'flk2-trusts': 'estates',
  'flk2-crime': 'criminal',
  'flk2-criminal-practice': 'criminal',
  'sqe2-interview': 'clientSkills',
  'sqe2-advocacy': 'dispute',
  'sqe2-analysis': 'clientSkills',
  'sqe2-research': 'institutions',
  'sqe2-writing': 'clientSkills',
  'sqe2-drafting': 'contractEthics',
  foundations: 'institutions',
  housing: 'property',
  employment: 'business',
  immigration: 'clientSkills',
  police: 'criminal',
};

export const subjectArtFor = (pathwayId: string): ImageSourcePropType =>
  sources[pathwayFamilies[pathwayId] ?? 'institutions'];
