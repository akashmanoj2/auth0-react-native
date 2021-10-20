import React, {useState} from 'react';
import Auth0 from 'react-native-auth0';
import {Alert, ToastAndroid, StyleSheet, Text, View} from 'react-native';
import axios from 'axios';
import {DataTable, Button} from 'react-native-paper';

const WebLogin = () => {
  const auth0 = new Auth0({
    domain: 'dev-qro6os72.us.auth0.com',
    clientId: 'Mk8ifH5fjUoAInyAoWOc1dTGPymxLzXT',
  });
  const [accessToken, setAcccessToken] = useState(null);
  const [genres, setGenres] = useState(null);
  const loggedIn = accessToken === null ? false : true;

  const _onLogin = () => {
    auth0.webAuth
      .authorize({
        scope: 'openid profile email',
        prompt: 'login',
        audience: 'https://dev-qro6os72.us.auth0.com/api/v2/',
      })
      .then(credentials => {
        setAcccessToken(credentials.accessToken);
        console.log('accessToken: ', credentials.accessToken);
        showToast('Access token set !');
      })
      .catch(error => {
        console.log(error);
        showToast('Error occured and logged!');
      });
  };

  const _onLogout = () => {
    auth0.webAuth
      .clearSession({})
      .then(success => {
        Alert.alert('Logged out!');
        setAcccessToken(null);
        setGenres(null);
      })
      .catch(error => {
        console.log('Log out cancelled');
      });
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
            <DataTable.Title>Id</DataTable.Title>
            <DataTable.Title>Type</DataTable.Title>
          </DataTable.Header>
          {genres.map(genre => (
            <DataTable.Row key={genre.id}>
              <DataTable.Cell>{genre.id}</DataTable.Cell>
              <DataTable.Cell>{genre.type}</DataTable.Cell>
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
      <Text>You are{loggedIn ? ' ' : ' not '}logged in .</Text>
      <Button
        style={styles.actionButtons}
        mode="contained"
        onPress={loggedIn ? _onLogout : _onLogin}>
        {loggedIn ? 'Log Out' : 'Log In'}
      </Button>
      {accessToken && (
        <Button
          mode="contained"
          style={styles.actionButtons}
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
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  actionButtons: {
    marginVertical: 10,
  },
  table: {
    paddingTop: 50,
    paddingHorizontal: 30,
  },
});

export default WebLogin;
