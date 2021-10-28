import React, {useState} from 'react';
import {Alert, ToastAndroid, StyleSheet, Text, View} from 'react-native';
import axios from 'axios';
import {DataTable, TextInput, Button} from 'react-native-paper';
import Amplify, {Auth} from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_LDr2tD35o',
    userPoolWebClientId: '745ofo7at3vfvf9r96d097aeus',
  },
});

function makePassword(length) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const AwsLogin = () => {
  const [token, setToken] = useState(null);
  const [genres, setGenres] = useState(null);
  const [mobileNumber, setMobileNumber] = useState(null);
  const [isOtpSend, setIsOtpSend] = useState(false);
  const [otp, setOtp] = useState(null);
  const [cognitoUser, setCognitoUser] = useState(null);

  const _onLogin = async () => {
    const user = await Auth.sendCustomChallengeAnswer(cognitoUser, otp);
    setCognitoUser(user);

    // It we get here, the answer was sent successfully,
    // but it might have been wrong (1st or 2nd time)
    // So we should test if the user is authenticated now
    try {
      // This will throw an error if the user is not yet authenticated:
      const {
        accessToken: {jwtToken},
      } = await Auth.currentSession();
      setOtp(null);
      console.log('accessToken: ', jwtToken);
      setToken(jwtToken);
      showToast('Access token set !');
    } catch (error) {
      console.log('Error occured while logging in: ', error);
      showToast('Invalid code entered !');
    }
  };

  const _onLogout = async () => {
    try {
      await Auth.signOut();
      setToken(null);
      setGenres(null);
      setIsOtpSend(false);
      setMobileNumber(null);
      Alert.alert('Logged out!');
    } catch (error) {
      showToast('Error occured !');
      console.log('Error occured while signing out: ', error);
    }
  };

  const getMovieGenresFromApi = () => {
    axios
      .get('http://10.0.2.2:3000/api/genres/aws', {
        headers: {Authorization: `Bearer ${token}`},
      })
      .then(res => {
        console.log('response:', res.data);
        showToast('API called successfully !');
        setGenres(res.data);
      })
      .catch(error => {
        console.log('error occured while fetching API: ', error);
        showToast('Error occured !');
      });
  };

  let genresTable;
  if (genres) {
    genresTable = (
      <View style={styles.table}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Id </DataTable.Title>
            <DataTable.Title> Type </DataTable.Title>
          </DataTable.Header>
          {genres.map(genre => (
            <DataTable.Row key={genre.id}>
              <DataTable.Cell>{genre.id} </DataTable.Cell>
              <DataTable.Cell> {genre.type} </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </View>
    );
  }

  const showToast = message => {
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      0,
      250,
    );
  };

  const sendOtp = async () => {
    let user;
    try {
      try {
        user = await Auth.signIn('+91' + mobileNumber);
        console.log('Existing user, signing in ...');
      } catch (error) {
        console.log('New user, signing up automatically...');
        const params = {
          username: '+91' + mobileNumber,
          password: makePassword(10),
        };
        await Auth.signUp(params);
        user = await Auth.signIn('+91' + mobileNumber);
      } finally {
        setCognitoUser(user);
        setIsOtpSend(true);
      }
    } catch (error) {
      console.log('Error occured while sending OTP: ', error);
      showToast('Error occured !');
    }
  };

  return (
    <View style={styles.container}>
      <Text> You are{token ? ' ' : ' not '} logged in .</Text>
      <View style={styles.inputSection}>
        <TextInput
          label="Mobile Number"
          mode="outlined"
          value={mobileNumber}
          left={<TextInput.Affix text="+91" />}
          onChangeText={text => setMobileNumber(text)}
        />
        <Button
          disabled={token || !mobileNumber}
          style={styles.actionButtons}
          mode="contained"
          onPress={sendOtp}>
          {isOtpSend ? 'Resend OTP' : 'Send OTP'}
        </Button>
      </View>

      {isOtpSend && (
        <View style={styles.inputSection}>
          {!token && (
            <TextInput
              mode="outlined"
              label="Enter OTP"
              value={otp}
              onChangeText={text => setOtp(text)}
            />
          )}
          <Button
            style={styles.actionButtons}
            mode="contained"
            onPress={token ? _onLogout : _onLogin}>
            {token ? 'Log out' : 'Log in'}
          </Button>
        </View>
      )}

      {token && (
        <Button
          style={styles.actionButtons}
          mode="contained"
          onPress={getMovieGenresFromApi}>
          Call API
        </Button>
      )}
      {genresTable && genresTable}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputSection: {
    marginVertical: 15,
  },
  actionButtons: {
    marginVertical: 10,
  },
  table: {
    paddingTop: 20,
    paddingHorizontal: 30,
  },
});

export default AwsLogin;
