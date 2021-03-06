import React from 'react'
import Layout from '../../components/default_layout';
import { Container, Typography } from '@material-ui/core/';
import { Scheduler, WeekView,Appointments } from '@devexpress/dx-react-scheduler-material-ui';
import { ViewState } from '@devexpress/dx-react-scheduler';
import querystring from 'querystring';
import { withAuthSync } from '../../utils/auth';
import background from '../../public/images/time.jpg';
const fetch = require("node-fetch");
import TermSelector from '../../components/course/searchForm/TermSelector.js';
import Grid from '@material-ui/core/Grid';

const Appointment = ({
  children, style, ...restProps
}) => (
  <Appointments.Appointment
    {...restProps}
    style={{
      ...style,
      backgroundColor: '#FFC107',
      borderRadius: '8px',
    }}
  >
    {children}
  </Appointments.Appointment>
);

const getWeekDay = function(){
  const dateOfToday = Date.now();
  var currentDate = new Date(dateOfToday);
  var timesStamp = currentDate.getTime();
  var currenDay = currentDate.getDay();
  console.log("今天是："+currenDay);
  var dates = [];
  var start_time = timesStamp - 24 * 60 * 60 * 1000 * currenDay;
  console.log("start_time:"+start_time);
  for (var i = 0; i < 7; i++) {
      dates.push(new Date(start_time + 24 * 60 * 60 * 1000 * (i % 7)));
  }
  console.log("dates:"+dates);
  return dates;
};

const parseTime=function(data){
  // console.log("data:");
  // console.log(data);
  var dates=getWeekDay();
  var res=[];
  data.forEach(item=>{
  var slot=item.meeting_time;
  var array=slot.split(',');
  
  // console.log(array);
  array.forEach(time=>{
    if(time.length>3){
      var json={title: item.course_title,
        code: item.course_id,
        type: item.course_type,
        startDate:0,
        endDate:0,
      }
      var group = time.split(" ");
      var year =2019;
      var month = 10;
      var day = 0;
      var start_hour=0;
      var start_min = 0;
      var end_hour=0;
      var end_min = 0;
      if(group[0]=="M"){
        day = dates[1].getDate();
        month = dates[1].getMonth();
        year = dates[1].getYear();
      }else if(group[0]=="Tu"){
        day = dates[2].getDate();
        month = dates[2].getMonth();
        year = dates[2].getYear();
      }else if(group[0]=="W"){
        day = dates[3].getDate();
        month = dates[3].getMonth();
        year = dates[3].getYear();
      }else if(group[0]=="Th"){
        day = dates[4].getDate();
        month = dates[4].getMonth();
        year = dates[4].getYear();
      }else if(group[0]=="F"){
        day = dates[5].getDate();
        month = dates[5].getMonth();
        year = dates[5].getYear();
      }else if(group[0]=="Sa"){
        day = dates[6].getDate();
        month = dates[6].getMonth();
        year = dates[6].getYear();
      }else if(group[0]=="Su"){
        day = dates[0].getDate();
        month = dates[0].getMonth();
        year = dates[0].getYear();
      }
      var hour_slot = group[1].split(/[-:]/);
      if(group[1].charAt(group[1].length-1)=="p"&&parseInt(hour_slot[0])>parseInt(hour_slot[2])){
        start_hour = parseInt(hour_slot[0]);
        start_min = parseInt(hour_slot[1]);
        end_hour = parseInt(hour_slot[2])+12;
        end_min = parseInt(hour_slot[3].substring(0,hour_slot[3].length-1));
      }else if(group[1].charAt(group[1].length-1)=="p"&&(parseInt(hour_slot[0])<12&&parseInt(hour_slot[2])<12)){
        // console.log("in +12")
        start_hour = parseInt(hour_slot[0])+12;
        start_min = parseInt(hour_slot[1]);
        end_hour = parseInt(hour_slot[2])+12;
        end_min = parseInt(hour_slot[3].substring(0,hour_slot[3].length-1));
      }
      else{
        start_hour = parseInt(hour_slot[0]);
        start_min = parseInt(hour_slot[1]);
        end_hour = parseInt(hour_slot[2]);
        end_min = parseInt(hour_slot[3]);
      }
      json.startDate=new Date(year+1900, month, day, start_hour, start_min);
      json.endDate=new Date(year+1900, month, day, end_hour, end_min);
      res.push(json);
    }
  })
});
// console.log(res);
return res;
};

class Schedule extends React.PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      data: [],
      currentDate: new Date('2019-11-27'),
      userName: '',
      term: '2020-Winter',
    };
  }

  static getInitialProps({query}) {
    return {query}
  }

  setTerm = (term) => {
    this.setState({ term: term });
    // console.log('in setTerm:' + term);
    this.getCourse(term);
  };

  getCourse = (term)=>{
    // console.log("in gerCourse:"+ term);
    // console.log("in gerCourse this.state.term:"+this.state.term);
    var u_id = this.props.query.u_id || this.props.token;
    if (u_id != undefined) {
      fetch('/api/users/' + u_id)
        .then(res => res.json())
        .then(data => {
          this.setState({userName: data[0].name}) ;
        })
    }
    const params={
      user_id:u_id,
      term:term,
    };
    const url = '/api/schedule?'+ querystring.stringify(params);

    fetch(url)
      .then(res => res.json())
      .then(data => {
       this.setState({data:parseTime(data)}) ;
      })
      .catch(e => console.log('错误:', e));
  }

  componentWillMount(){
    this.getCourse(this.state.term);
  }
  render()
  {
    const { data, currentDate, userName } = this.state;
    // console.log(this.state.data);
    return (
      <Layout title="Schedule" loginStatus={this.props.loginStatus} background={background}>
        <Container maxWidth = 'lg' style={{ flex: 1 }}>
          <h1>{userName? (userName + "'s Schedule"): ("Schedule")}</h1>
          <Grid item xs={12}>
            <TermSelector term={this.state.term} setTerm={this.setTerm} />
          </Grid>
          <Scheduler
          data = {this.state.data}
          >
            <ViewState
            />
            <WeekView
              startDayHour={8}
              endDayHour={20}
            />
            <Appointments appointmentComponent={Appointment}>
            </Appointments>
          </Scheduler>
        </Container>
      </Layout>
    );
  }
}
export default withAuthSync(Schedule);