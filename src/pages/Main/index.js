import React, { Component } from 'react';
import { Keyboard, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

import api from '../../services/api';

import { Container, Form, Input, SubmitButton, List, User, Avatar, Name, Bio, ProfileButton, ProfileButtonText } from './styles';

export default class Main extends Component {
  static navigationOptions = {
    title: 'Usuários',
  };

  static propTypes() {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }).isRequired
  };

  state = {
    newUser: '',
    users: [],
    loading: false,
    error: false,
  }

  async componentDidMount() {
    const users = await AsyncStorage.getItem('users');

    if (users) {
      this.setState({
        users: JSON.parse(users)
      });
    }
  }

  async componentDidUpdate(_, prevState) {
    const { users } = this.state;

    if(prevState.users !== users) {
      AsyncStorage.setItem('users', JSON.stringify(users));
    }
  }

  handleAddUser = async () => {
    const { users, newUser } = this.state;

    try {
      this.setState({
        loading: true,
        error: false,
      });

      const response = await api.get(`/users/${newUser}`);

      const data = {
        name: response.data.name,
        login: response.data.login,
        bio: response.data.bio,
        avatar: response.data.avatar_url,
      }

      this.setState({
        users: [... users, data],
        newUser: '',
        loading: false,
      });
    } catch(error) {
      this.setState({
        error: true,
      });
    } finally {
      this.setState({
        loading: false,
      });
      Keyboard.dismiss();
    }
  }

  handleNavigate = (user) => {
    const { navigation } = this.props;

    navigation.navigate('User', { user });
  }

  render() {
    const { users, newUser, loading, error } = this.state;

    return (
      <Container>
        <Form error={error}>
          <Input autoCorrect={false} autoCaptilize="none"
            value={newUser}
            onChangeText={text => this.setState({ newUser: text })}
            placeholder="Adicionar usuário"
            returnKeyType="send"
            onSubmitEditing={this.handleAddUser}
            />

          <SubmitButton loading={loading} onPress={this.handleAddUser}>
          { loading ? (<ActivityIndicator color="#fff"/>) :
              (<Icon name="add" size={20} color="#fff"/>) }
          </SubmitButton>
        </Form>

        <List
          data={users}
          keyExtractor={user => user.login}
          renderItem={({ item }) => (
            <User>
              <Avatar source={{ uri: item.avatar }} />
              <Name>{item.name}</Name>
              <Bio>{item.bio}</Bio>

              <ProfileButton onPress={() => this.handleNavigate(item)}>
                <ProfileButtonText>Perfil</ProfileButtonText>
              </ProfileButton>
            </User>
          )}
        />
      </Container>
    );
  }
}
