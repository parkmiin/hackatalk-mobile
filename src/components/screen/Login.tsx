import * as AppAuth from 'expo-app-auth';
import * as Facebook from 'expo-facebook';
import * as GoogleSignIn from 'expo-google-sign-in';

import { Alert, Platform, TouchableOpacity, View } from 'react-native';
import { DefaultNavigationProps, User } from '../../types';
import React, { useEffect, useState } from 'react';
import {
  androidExpoClientId,
  iOSClientId,
  iOSExpoClientId,
} from '../../../config';
import styled, {
  DefaultTheme,
  ThemeProps,
  withTheme,
} from 'styled-components/native';

import Button from '../shared/Button';
import Constants from 'expo-constants';
import { Button as DoobooButton } from '@dooboo-ui/native';
import { IC_ICON } from '../../utils/Icons';
import { Ionicons } from '@expo/vector-icons';
import StatusBar from '../shared/StatusBar';
import TextInput from '../shared/TextInput';
import { colors } from '../../theme';
import { getString } from '../../../STRINGS';
import { useThemeContext } from '../../providers/ThemeProvider';

interface Props extends ThemeProps<DefaultTheme> {
  navigation: DefaultNavigationProps;
}

const StyledScrollView = styled.ScrollView``;

const StyledSafeAreaView = styled.SafeAreaView`
  flex: 1;
  background: ${({ theme }): string => theme.background};
`;

const StyledContainer = styled.View`
  flex: 1;
  margin-top: 40;
  flex-direction: column;
  align-items: center;
`;

const StyledIconWrapper = styled.View`
  position: absolute;
  top: 48px;
  left: 40px;
  flex-direction: column;
  align-items: flex-start;
`;

const StyledIcon = styled.Image`
  width: 60px;
  height: 60px;
`;

const StyledIconText = styled.Text`
  color: ${({ theme }): string => theme.fontColor};
  font-size: 20px;
  font-weight: bold;
  margin-top: 8px;
`;

const StyledInputWrapper = styled.View`
  margin-top: 220px;
  align-self: stretch;
  flex-direction: column;
  align-items: center;
  padding: 0 44px;
`;

const StyledButtonWrapper = styled.View`
  flex: 1;
  margin-top: 20px;
  height: 60px;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  align-self: stretch;
`;

const StyledTextForgotPw = styled.Text`
  font-size: 12px;
  color: ${({ theme }): string => theme.tintColor};
  text-decoration-line: underline;
`;

function Screen(props: Props): React.ReactElement {
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [signingInFacebook, setSigningInFacebook] = useState<boolean>(false);
  const [googleUser, setGoogleUser] = useState<User | null | unknown>(null);
  const [signingInGoogle, setSigningInGoogle] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  let timer: number;

  const onTextChanged = (type: string, text: string): void => {
    // prettier-ignore
    switch (type) {
      case 'EMAIL':
        setEmail(text);
        break;
      case 'PW':
        setPw(text);
        break;
    }
  };

  const goToSignUp = (): void => {
    props.navigation.navigate('SignUp');
  };

  const goToFindPw = (): void => {
    props.navigation.navigate('FindPw');
  };

  const onLogin = (): void => {
    setIsLoggingIn(true);
    timer = setTimeout(() => {
      setIsLoggingIn(false);
      clearTimeout(timer);
      if (props.navigation) {
        props.navigation.resetRoot({
          index: 0,
          routes: [{ name: 'MainStack' }],
        });
      }
    }, 1000);
  };

  const initAsync = async (): Promise<void> => {
    await GoogleSignIn.initAsync({
      clientId: iOSClientId,
    });
  };

  const googleSignOutAsync = async (): Promise<void> => {
    await GoogleSignIn.signOutAsync();
    setGoogleUser(null);
  };

  const googleSignInAsync = async (): Promise<void> => {
    setSigningInGoogle(true);
    if (Constants.appOwnership === 'expo') {
      try {
        const response = await AppAuth.authAsync({
          issuer: 'https://accounts.google.com',
          scopes: ['profile'],
          clientId: Platform.select({
            ios: iOSExpoClientId,
            android: androidExpoClientId,
          }),
        });
        // console.log(response);
      } catch ({ message }) {
        // console.log('err', message);
      } finally {
        setSigningInGoogle(false);
      }
      return;
    }
    try {
      await GoogleSignIn.askForPlayServicesAsync();
      const { type, user } = await GoogleSignIn.signInAsync();
      if (type === 'success') {
        setGoogleUser(user);
      }
    } catch ({ message }) {
      Alert.alert('login: Error:' + message);
    } finally {
      setSigningInGoogle(false);
    }
  };

  const facebookLogin = async (): Promise<void> => {
    setSigningInFacebook(true);
    try {
      const { type, token } = await Facebook.logInWithReadPermissionsAsync(
        Constants.manifest.facebookAppId,
        {
          permissions: ['email', 'public_profile'],
        },
      );
      if (type === 'success') {
        const response = await fetch(
          `https://graph.facebook.com/me?fields=
            id,name,email,birthday,gender,first_name,last_name,picture
            &access_token=${token}`,
        );
        const responseObject = JSON.parse(await response.text());
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      /* istanbul ignore next */
      Alert.alert(`Facebook Login Error: ${message}`);
    } finally {
      setSigningInFacebook(false);
    }
  };

  useEffect(() => {
    initAsync();
    // console.log('appOwnership', Constants.appOwnership);
  }, []);

  const { theme, changeThemeType } = useThemeContext();

  const btnStyle = {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderRadius: 0,
    borderColor: theme.background,
  };

  return (
    <StyledSafeAreaView>
      <StyledScrollView>
        <StatusBar />
        <StyledContainer>
          <StyledIconWrapper>
            <TouchableOpacity onPress={(): void => changeThemeType()}>
              <StyledIcon source={IC_ICON} />
            </TouchableOpacity>
            <StyledIconText>{getString('HELLO')}.</StyledIconText>
          </StyledIconWrapper>
          <StyledInputWrapper>
            <TextInput
              testID="email_input"
              // txtLabel={ getString('EMAIL') }
              txtHint={getString('EMAIL')}
              txt={email}
              onTextChanged={(text: string): void =>
                onTextChanged('EMAIL', text)
              }
            />
            <TextInput
              testID="pw_input"
              style={{ marginTop: 8 }}
              // txtLabel={ getString('EMAIL') }
              txtHint={getString('PASSWORD')}
              txt={pw}
              onTextChanged={(text: string): void => onTextChanged('PW', text)}
              isPassword={true}
            />
            <StyledButtonWrapper>
              <Button
                testID="btnSignUp"
                onPress={goToSignUp}
                containerStyle={{ flex: 1, flexDirection: 'row' }}
                isWhite
              >
                {getString('SIGN_UP')}
              </Button>
              <View style={{ width: 8 }} />
              <Button
                testID="btnLogin"
                isLoading={isLoggingIn}
                onPress={onLogin}
                containerStyle={{ flex: 1, flexDirection: 'row' }}
              >
                {getString('LOGIN')}
              </Button>
            </StyledButtonWrapper>
            <View style={{ height: 16 }} />
            <TouchableOpacity
              testID="findPw"
              activeOpacity={0.5}
              onPress={goToFindPw}
            >
              <StyledTextForgotPw>{getString('FORGOT_PW')}</StyledTextForgotPw>
            </TouchableOpacity>
          </StyledInputWrapper>
          <View
            style={{
              flexDirection: 'column',
              alignSelf: 'stretch',
              paddingHorizontal: 44,
              paddingVertical: 16,
              marginBottom: 20,
            }}
          >
            <DoobooButton
              testID="btnGoogle"
              style={[
                btnStyle,
                {
                  backgroundColor: colors.google,
                  width: '100%',
                  marginTop: 20,
                },
              ]}
              leftComponent={
                <View
                  style={{
                    position: 'absolute',
                    left: 16,
                  }}
                >
                  <Ionicons name="logo-google" size={20} color="white" />
                </View>
              }
              isLoading={signingInGoogle}
              indicatorColor={theme.primary}
              onClick={googleSignInAsync}
              textStyle={{
                color: 'white',
                fontSize: 14,
                fontWeight: '500',
              }}
              text={'    ' + getString('SIGN_IN_WITH_GOOGLE')}
            />
            <View style={{ height: 4 }} />
            <DoobooButton
              testID="btnFacebook"
              style={[
                btnStyle,
                {
                  backgroundColor: colors.facebook,
                  width: '100%',
                },
              ]}
              leftComponent={
                <View
                  style={{
                    position: 'absolute',
                    left: 16,
                  }}
                >
                  <Ionicons name="logo-facebook" size={20} color="white" />
                </View>
              }
              isLoading={signingInFacebook}
              indicatorColor={theme.primary}
              onClick={facebookLogin}
              textStyle={{
                color: 'white',
                fontSize: 14,
                fontWeight: '500',
              }}
              text={'    ' + getString('SIGN_IN_WITH_FACEBOOK')}
            />
          </View>
        </StyledContainer>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
}

export default withTheme(Screen);
