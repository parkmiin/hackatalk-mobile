import React, { ReactElement } from 'react';

import { AllProviders } from '../providers';
import { ThemeType } from '../types';

export const createTestElement = (
  child: ReactElement,
  themeType?: ThemeType,
): ReactElement => (
  <AllProviders initialThemeType={themeType}>{child}</AllProviders>
);

export const createTestProps = (
  obj: object = {},
  moreScreenProps?: object,
): object | unknown | any => ({
  navigation: {
    navigate: jest.fn(),
    goBack: jest.fn(),
    resetRoot: jest.fn(),
  },
  screenProps: {
    changeThemeType: jest.fn(),
    ...moreScreenProps,
  },
  ...obj,
});
