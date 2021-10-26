import React, {useState, useEffect} from 'react';
import {Alert, ToastAndroid, StyleSheet, Text, View} from 'react-native';
import axios from 'axios';
import {DataTable, TextInput, Button} from 'react-native-paper';
import auth from '@react-native-firebase/auth';

const FirebaseLogin = () => {
  const [genres, setGenres] = useState(null);
  const [mobileNumber, setMobileNumber] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [otp, setOtp] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [token, setToken] = useState(null);

  // Handle user state changes
  const onAuthStateChanged = loggedInUser => {
    console.log('returned user: ', loggedInUser);
    if (loggedInUser) {
      auth()
        .currentUser.getIdToken()
        .then(idToken => {
          setToken(idToken);
          setLoggedIn(true);
          showToast('Token set !');
        })
        .catch(error => {
          console.log('Error occured while retreiving token: ', error);
          showToast('Error occured !');
        });
    } else {
      setToken(null);
      setLoggedIn(false);
    }
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const sendOtp = async () => {
    try {
      const confirmation = await auth().signInWithPhoneNumber(
        '+91' + mobileNumber,
      );
      setConfirm(confirmation);
      showToast('OTP send');
    } catch (error) {
      showToast('Error occured!');
      console.log('Error in sending OTP: ', error);
    }
  };

  const _onLogin = async () => {
    try {
      await confirm.confirm(otp);
      setOtp(null);
    } catch (error) {
      console.log('Error in login : ', error);
      showToast('Invalid code!');
    }
  };

  const _onLogout = () => {
    auth()
      .signOut()
      .then(() => {
        setGenres(null);
        setConfirm(null);
        setMobileNumber(null);
        Alert.alert('Logged out!');
      })
      .catch(error => {
        console.log('Error during logout: ', error);
        showToast('Error occured !');
      });
  };

  const getMovieGenresFromApi = () => {
    console.log('accessToken: ', token);
    axios
      .get('http://10.0.2.2:3000/api/genres/firebase', {
        headers: {Authorization: `Bearer ${token}`},
      })
      .then(res => {
        console.log('response:', res.data);
        showToast('API called successfully !');
        setGenres(res.data);
      })
      .catch(error => {
        console.log('error occured during api call: ', error);
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
        <Button
          disabled={loggedIn || !mobileNumber}
          style={styles.actionButtons}
          mode="contained"
          onPress={sendOtp}>
          {confirm ? 'Resend OTP' : 'Send OTP'}
        </Button>
      </View>

      {(loggedIn || confirm) && (
        <View style={styles.inputSection}>
          {!loggedIn && (
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
            onPress={loggedIn ? _onLogout : _onLogin}>
            {loggedIn ? 'Log out' : 'Log in'}
          </Button>
        </View>
      )}

      {/* {loggedIn && (
        <Button
          style={styles.actionButtons}
          mode="contained"
          onPress={_onLogout}>
          Log out
        </Button>
      )} */}

      {loggedIn && (
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

export default FirebaseLogin;
