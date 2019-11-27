// Libraries
import React from 'react';
import nextCookies from 'next-cookies';
import fetch from 'isomorphic-unfetch';
import { withAuthSync } from '../../utils/auth';

// Styles
import Layout from '../../components/default_layout';
import {
  Container, TextField, FormControl, IconButton, Button,
  InputLabel, OutlinedInput, InputAdornment, Typography, Link, Avatar, Grid
} from '@material-ui/core/';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { Autocomplete } from '@material-ui/lab';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import MajorList from '../../components/user/major_list';
import InterestList from '../../components/user/interest_list';
import ButtonLink from '../../components/button_link';
const useStyles = makeStyles(theme => ({
  form: {
    marginBottom: 150, 
  },
  avatarContainer: {
    width: 100,
    height: 100, 
  },
  avatar: {
    width: 110, 
    height: 110, 
  }, 
  textField: {
    marginBottom: theme.spacing(2),
  },
  password: {
    margin: theme.spacing(1.5, 0, 1),
  },
  submit: {
    margin: theme.spacing(2, 0, 1),
  },
}));

// Components
function FormComponent(props) {
  const classes = useStyles();
  let defaultMajor = { value: '' }
  if (props.data.major && props.data.major!=null) {
    defaultMajor = { value: props.data.major }
  }
  let defaultInterestList = []
  if (props.data.interests && props.data.interests != null && props.data.interests.length>0) {
    let interestsArr = JSON.parse(props.data.interests)
    defaultInterestList = interestsArr.map(value => ({value}))
  }
  const [values, setValues] = React.useState({
    realname: (props.data.name) ? props.data.name:'', 
    username: props.data.email, 
    password: '', 
    major: (props.data.major) ? props.data.major:'', 
    interests: defaultInterestList, 
    error: '', 
    usernameErr: '', 
    passwordErr: '', 
    showPassword: false, 
  });
  const handleChange = prop => (event, val) => {
    let v
    if (prop === 'major') {
      v = (val) ? val.value: ''
    } else if (prop === 'interests') {
      v = val.map(x => x.value)
    } else {
      v = event.target.value
    }
    setValues({ ...values, [prop]: v });
  };
  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };
  const handleMouseDownPassword = event => {
    event.preventDefault();
  };
  const handleSubmit = async event => {
    event.preventDefault()
    const URL = '/api/users/update';
    const payload = {
      id: props.uid, 
      realname: values.realname, 
      username: values.username, 
      password: values.password, 
      major: values.major, 
      interests: values.interests
    }
    try {
      const res = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'Accept': 'application/json', 
        }, 
        body: JSON.stringify(payload), 
      })
      if (res.status == 200) {
        const data = await res.json()
        Router.push('/')
      } else {
        let err = new Error(res.statusText)
        err.response = res
        throw err
      }
    } catch (error) {
      const { response } = error
      setValues(Object.assign({}, values, {
        error: response ? response.statusText : error.message,
      }))
    }
  };
  return (
    <form className={classes.form} noValidate autoComplete="off" onSubmit={handleSubmit}>
      <Grid container justify="center" alignItems="center">
      <Avatar className={classes.avatarContainer}>
        <AccountCircleIcon className={classes.avatar} />
      </Avatar>
      </Grid>
      <TextField
        id="name"
        margin="normal"
        fullWidth
        label="Name"
        variant="outlined"
        defaultValue={values.realname}
        onChange={handleChange('realname')}
      />
      <TextField
        id="email"
        name="username"
        margin="normal"
        fullWidth
        required
        label="Email"
        variant="outlined"
        helperText="Your email will be your login account"
        defaultValue={values.username}
        onChange={handleChange('username')}
      />
      <FormControl
        required
        fullWidth
        className={classes.password}
        variant="outlined">
        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password"
          name="password"
          type={values.showPassword ? 'text' : 'password'}
          value={values.password}
          onChange={handleChange('password')}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
              >
                {values.showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
          labelWidth={80}
        />
      </FormControl>
      <Autocomplete
        options={MajorList}
        getOptionLabel={option => option.value}
        // defaultValue={MajorList[10]}
        defaultValue={defaultMajor}
        onChange={handleChange('major')}
        renderInput={params => (
          <TextField {...params}
            variant="outlined"
            label="Major"
            margin="normal"
            name="major"
            fullWidth
          />
        )}
      />
      <Autocomplete
        multiple
        options={InterestList}
        getOptionLabel={option => option.value}
        filterSelectedOptions
        // defaultValue={[InterestList[0], InterestList[20], InterestList[30]]}
        defaultValue={defaultInterestList}
        onChange={handleChange('interests')}
        renderInput={params => (
          <TextField
            {...params}
            variant="outlined"
            label="Interests"
            margin="normal"
            name="interest"
            fullWidth
          />
        )}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
        >
        Save
      </Button>
      <Button 
        fullWidth
        variant="outlined"
        component={ButtonLink} 
        className={classes.link} 
        href={'/'}>
        Cancel
      </Button>
    </form>
  );
}

// Main
const Profile = ({ data, token, loginStatus }) => {
  return (
    <Layout title="Profile Settings" loginStatus={loginStatus}>
      <Container maxWidth="sm" style={{ flex: 1 }}>
        <h1>Profile Settings</h1>
        <FormComponent data={data} uid={token} />
      </Container>
    </Layout>
  );
}

Profile.getInitialProps = async ctx => {
  let data = {}
  const { token } = nextCookies(ctx)
  const fetchURL = `/api/users/${token}`;
  try {
    const res = await fetch(fetchURL)
    if (res.status == 200) {
      data = await res.json()
    } else {
      let err = new Error(res.statusText)
      err.response = res
      throw err
    }
  } catch (error) {
    const { response } = error
    const err = response ? response.statusText : error.message
    console.log('[Error] get user profile: ', err)
  }
  return { data: data[0] }
}

export default withAuthSync(Profile)