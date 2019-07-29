import React, { Component } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';

import { Container, Header, Avatar, Name, Bio, Stars, Starred, OwnerAvatar, Info, Title, Author, Loading } from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  }

  state = {
    stars: [],
    loading: true,
    page: 1,
    refreshing: false,
  };

  componentDidMount() {
   this.load(1);
  }

  loadMore = () => {
    this.setState({
      loading: true,
    });

    let { page } = this.state;

    page = page + 1;

    this.load(page);
  }

  load = async (page) => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(`users/${user.login}/starred`, {
      params: {
        page: page,
        per_page: 30,
      }
    });

    this.setState({
      stars: response.data,
      loading: false,
      page: page,
    });
  }

  refreshList = () => {
    this.setState({
      loading: true,
      refreshing: true,
      page: 1,
    });

    this.load(1);

    this.setState({
      refreshing: false,
    });
  }

  handleNavigate = (repository) => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repository });
  }

  render() {
    const { navigation } = this.props;
    const { stars, loading } = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {(loading ? (<Loading />) :
          (<Stars loading={loading}
            onEndReachedThreshol={0.2}
            onEndReached={this.loadMore}
            data={stars}
            onRefresh={this.refreshList}
            refreshing={this.state.refreshing}
            keyExtractor={star => String(star.id)}
            renderItem={({item}) => (
              <Starred onPress={() => this.handleNavigate(item)}>
                <OwnerAvatar source={{ uri: item.owner.avatar_url}} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />)
        )}
      </Container>
    );
  }
}
