import React, {useState} from 'react';
import Auth0 from 'react-native-auth0';
import {Alert, ToastAndroid, StyleSheet, Text, View} from 'react-native';
import axios from 'axios';
import {DataTable, TextInput, Button} from 'react-native-paper';

const MobileLogin = () => {
  const auth0 = new Auth0({
    domain: 'dev-qro6os72.us.auth0.com',
    clientId: 'Mk8ifH5fjUoAInyAoWOc1dTGPymxLzXT',
  });

  const [accessToken, setAcccessToken] = useState(null);
  const [genres, setGenres] = useState(null);
  const [mobileNumber, setMobileNumber] = useState(null);
  const [isOtpSend, setIsOtpSend] = useState(false);
  const [otp, setOtp] = useState(null);
  const loggedIn = accessToken === null ? false : true;

  const _onLogin = () => {
    auth0.auth
      .loginWithSMS({
        phoneNumber: '+91' + mobileNumber,
        code: otp,
        audience: 'https://dev-qro6os72.us.auth0.com/api/v2/',
        scope: 'offline_access openid profile email',
      })
      .then(credentials => {
        setAcccessToken(credentials.accessToken);
        setOtp(null);
        console.log('accessToken: ', credentials.accessToken);
        console.log('refreshToken: ', credentials.refreshToken);
        showToast('Access token set !');
      })
      .catch(error => {
        console.log(error);
        showToast('Error occured and logged!');
      });
  };

  const _onLogout = () => {
    setAcccessToken(null);
    setGenres(null);
    setIsOtpSend(false);
    setMobileNumber(null);
    Alert.alert('Logged out!');
  };

  const getMovieGenresFromApi = () => {
    axios
      .get('http://10.0.2.2:3000/api/genres', {
        headers: {Authorization: `Bearer ${accessToken}`},
      })
      .then(res => {
        console.log('response:', res.data);
        showToast('API called successfully !');
        setGenres(res.data);
      })
      .catch(error => {
        console.log('error: ', error);
        showToast('Error occured and logged!');
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

  const sendOtp = () => {
    auth0.auth
      .passwordlessWithSMS({
        phoneNumber: '+91' + mobileNumber,
      })
      .then(result => {
        setIsOtpSend(true);
        console.log(result);
      })
      .catch(console.error);
  };

  return (
    <View style={styles.container}>
      <Text> You are{loggedIn ? ' ' : ' not '} logged in .</Text>
      <View style={styles.inputSection}>
        <TextInput
          label="Mobile Number"
          mode="outlined"
          value={mobileNumber}
          left={<TextInput.Affix text="+91" />}
          onChangeText={text => setMobileNumber(text)}
        />
        <Button style={styles.actionButtons} mode="contained" onPress={sendOtp}>
          {isOtpSend ? 'Resend OTP' : 'Send OTP'}
        </Button>
      </View>

      {isOtpSend && (
        <View style={styles.inputSection}>
          {!accessToken && (
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
            onPress={accessToken ? _onLogout : _onLogin}>
            {accessToken ? 'Log out' : 'Log in'}
          </Button>
        </View>
      )}

      {accessToken && (
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

export default MobileLogin;
