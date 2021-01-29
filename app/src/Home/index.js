import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import { withAuth } from '@okta/okta-react';

import GithubRepo from "../GithubRepo"
import SearchBar from "../SearchBar"

import githubClient from '../githubClient'
import APIClient from '../apiClient'

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: 30
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
});

class Home extends React.Component {
  state = {
    value: 0,
    repos: [],
    sbDatas: []
  };

  async componentDidMount() {
    const accessToken = await this.props.auth.getAccessToken()
    this.apiClient = new APIClient(accessToken);
    this.apiClient.getsbDatas().then((data) => 
      this.setState({...this.state, sbDatas: data})
    ); 
  }

  handleTabChange = (event, value) => {
    this.setState({ value });
  };

  handleTabChangeIndex = index => {
    this.setState({ value: index });
  };

  resetRepos = repos => this.setState({ ...this.state, repos })

  issbData = repo => this.state.sbDatas.find(r => r.id == repo.id)
  
  onsbData = (repo) => {
    this.updateBackend(repo);
  }

  updateBackend = (repo) => {
    if (this.issbData(repo)) {
      this.apiClient.deletesbData(repo);
    } else {
      this.apiClient.createsbData(repo);
    }
    this.updateState(repo);
  }
  updateState = (repo) => {
    if (this.issbData(repo)) {
      this.setState({
        ...this.state,
        sbDatas: this.state.sbDatas.filter( r => r.id !== repo.id )
      })
    } else {
      this.setState({
        ...this.state,
        sbDatas: [repo, ...this.state.sbDatas]
      })
    }
  }

  onSearch = (event) => {
    const target = event.target;
    if (!target.value || target.length < 3) { return }
    if (event.which !== 13) { return }

    githubClient
      .getJSONRepos(target.value)
      .then((response) => {
        target.blur();
        this.setState({ ...this.state, value: 1 });
        this.resetRepos(response.items);
      })
  }
  
  renderRepos = (repos) => {
    if (!repos) { return [] }
    return repos.map((repo) => {
      return (
        <Grid item xs={12} md={3} key={repo.id}>
          <GithubRepo onsbData={this.onsbData} issbData={this.issbData(repo)} repo={repo} />
        </Grid>
      );
    })
  }

  render() {
    return (
      <div className={styles.root}>
        <SearchBar auth={this.props.auth} onSearch={this.onSearch} />
         <Tabs
          value={this.state.value}
          onChange={this.handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          fullWidth
        >
          <Tab label="sbDatas" />
          <Tab label="Search" />
        </Tabs>
        
        <SwipeableViews
          axis={'x-reverse'}
          index={this.state.value}
          onChangeIndex={this.handleTabChangeIndex}
        >
          <Grid container spacing={16} style={{padding: '20px 0'}}>
            { this.renderRepos(this.state.sbDatas) }
          </Grid>
          <Grid container spacing={16} style={{padding: '20px 0'}}>
            { this.renderRepos(this.state.repos) }
          </Grid>
        </SwipeableViews>
      </div>
    );
  }
}

export default withStyles(styles)(withAuth(Home));