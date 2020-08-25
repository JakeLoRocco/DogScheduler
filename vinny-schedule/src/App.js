import React from 'react';

import './App.css';

const API_URL = 'http://localhost:5000/actions';

function App() {
  
  return (
    <div>
      <h1 className="title">Vinny Scheduler</h1>
      <OptionMenu />
      <br />
      <br />
      <Schedule />
    </div>
  );
}

//Now just need to create a way to get the actions and display them in a nice schedule.
//Clean out the database.
class Schedule extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      logs: null
    };
  }

  //FINISH THIS FUNCTION.
  componentDidMount() {
    getSchedule()
      .then( res => res.json() )
      .then( result => {

        this.setState( {logs: result} );
        console.log(this.state.logs);
      });
  }
  //Display it too. Probably by using child components.
  //One component creates the grid (7 days, 4am to 10 pm every day, 10 min intervals or dynamic?).
  //Second component creates the overlays given the action object (can line up directly or dynamically)

  render() {
//<OverlayActions logs ={this.state.logs} />
    return(
      <div className="schedule" style={{position: 'relative'}}>
        <BaseTable />
        <div className="scheduleSlot">🍖🔫💩🚶🏻‍♂️☀️🌙</div>
      </div>
    );
  }
}

/*
Columns, Pixels
Sunday, 74
Monday, 178
Tuesday, 282
Wednesday, 388
Thursday, 496
Friday, 602
Saturday, 708
*/

class OverlayActions extends React.Component {

  render() {
    let dayStyle = [74, 178, 282, 388, 496, 602, 708]; //Pixels //Move to the schedule slot?

    const logs = this.props.logs;

    const slots = logs.map( (log) => (
      
      //Need to figure out how to determine the column of the current day...
      <ScheduleSlot key={"slot" + log.timestamp} />
    ));
    
    return(
      <div></div>
    );
  }
}

function ScheduleSlot(props) {

  return(
    <div></div>
  );
}

class BaseTable extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      times: null
    };
  }
  
  render() {
    const style = {width: "10%", fontSize: "calc(2vmin)"};

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const baseHeaders = days.map( (day) =>
      <BaseHeader key={day} day={day} style={style} />
    );

    const times = getTimes();
    const baseRows = times.map( (time) => 
      <BaseRow key={time.toLocaleTimeString()} time={time} style={style} />
    );

    return(
      <div className="scheduleSkeleton">
        <table style={{width: "800px"}}>
          <thead>
            <tr className="headerRow">
              <td style={{width: "5%"}}></td>
              {baseHeaders}
            </tr>
          </thead>
          <tbody>
            {baseRows}
          </tbody>
        </table>
      </div>
    );
  }
}

//alternate time display props.time.toLocaleTimeString()
function BaseRow(props){
  return (
    <tr className="baseRow">
      <td className="baseCell">
      {
        (props.time.getHours() < 10 ? '0' + props.time.getHours() : props.time.getHours() ) + ':' +
        (props.time.getMinutes() < 10 ? '0' + props.time.getMinutes() : props.time.getMinutes() )
      }
      </td>
    </tr>
  );
}

function BaseHeader(props){
  return <th style={props.style}>{props.day}</th>
}

class VinnyAction extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    this.props.action();
    event.preventDefault();
  }

  render() {

    const isToggleOn = this.props.toggledOn;
    const divStyle = {
      backgroundColor: isToggleOn ? 'yellow' : 'white'
    }
    
    return(
      <button onClick={this.handleClick}
              className='main-button'
              style={divStyle}
              >
        {this.props.name}
      </button>
    )
  }

}


class OptionMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = { 
      ate: false,
      peed: false,
      pooped: false,
      walked: false,
      woke: false,
      slept: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);

    this.toggleAte = this.toggleAte.bind(this);
    this.togglePeed = this.togglePeed.bind(this);
    this.togglePooped = this.togglePooped.bind(this);
    this.toggleWalked = this.toggleWalked.bind(this);
    this.toggleWoke = this.toggleWoke.bind(this);
    this.toggleSlept = this.toggleSlept.bind(this);
  }


  toggleAte() {
    const alreadyAte = this.state.ate; 
    this.setState( {ate: !alreadyAte} );
  }

  togglePeed() {
    const alreadyPeed = this.state.peed;
    this.setState( {peed: !alreadyPeed } );
  }

  togglePooped() {
    const alreadyPooped = this.state.pooped;
    this.setState( {pooped: !alreadyPooped} );
  }

  toggleWalked() {
    const alreadyWalked = this.state.walked;
    this.setState( {walked: !alreadyWalked} );
  }

  toggleWoke() {
    const alreadyWoke = this.state.woke;
    this.setState( {woke: !alreadyWoke} );
  }

  toggleSlept() {
    const alreadySlept = this.state.slept;
    this.setState( {slept: !alreadySlept} );
  }

  handleSubmit(event) {
    //Process and validate the time.
    const formData = new FormData(event.target);
    let timestamp = new Date(); //Info events are always from the current day.

    const formTime = formData.get('timestamp');

    if( formTime ) {
      const hours = formTime.substring(0, 2);
      const minutes = formTime.substring(3, 5);

      timestamp.setHours(hours);
      timestamp.setMinutes(minutes);
    }

    //Get the current state of the actions.
    const status = {
      ate: this.state.ate,
      peed: this.state.peed,
      pooped: this.state.pooped,
      walked: this.state.walked,
      woke: this.state.woke,
      slept: this.state.slept,
      timestamp: timestamp.toLocaleString()
      
    }
    sendActions(status);

    //Reset the VinnyAction buttons.
    this.setState({
      ate: false,
      peed: false,
      pooped: false,
      walked: false,
      woke: false,
      slept: false
    });

    //Reset the rest of the form.
    event.target.reset();
    event.preventDefault();
  }

  render() {
    return (
      <form className="options-form" onSubmit={this.handleSubmit}>

        <input type="time" id="timestamp" name="timestamp" pattern="[0-9]{2}:[0-9]{2}"></input>

        <br />
        <br />

        <VinnyAction 
          id="eat"
          name="🍖"
          action={this.toggleAte}
          toggledOn={this.state.ate}
        />
        <VinnyAction 
          id="pee"
          name="🔫"
          action={this.togglePeed}
          toggledOn={this.state.peed}
        />
        <VinnyAction 
          id="poop"
          name="💩"
          action={this.togglePooped}
          toggledOn={this.state.pooped}
        />
        <VinnyAction 
          id="walk"
          name="🚶🏻‍♂️"
          action={this.toggleWalked}
          toggledOn={this.state.walked}
        />
        <VinnyAction 
          id="woke"
          name="☀️"
          action={this.toggleWoke}
          toggledOn={this.state.woke}
        />
        <VinnyAction 
          id="slept"
          name="🌙"
          action={this.toggleSlept}
          toggledOn={this.state.slept}
        />

      <br />
      <br />
      <input className="submit-button" type="submit" value="Submit" />
      </form>
    )
  }

}

async function getSchedule() {
  const response = await fetch( API_URL, {
    method: 'GET',
  });
  
  return await response;
}


async function sendActions( actions ) {
  const response = await fetch( API_URL, {
    method: 'POST',
    body: JSON.stringify(actions),
    headers: {
      'content-type': 'application/json'
    }
  });

  if( !response.ok ){
      console.log('error in posting actions.');
  } else {
    console.log('successful.');
  }

  const json = await response.json();

  console.log(json);
  console.log(json.timestamp);
}

function getTimes() {
  let startTime = new Date();
  startTime.setHours(4);
  startTime.setMinutes(0);
  startTime.setSeconds(0);
  startTime.setMilliseconds(0);

  let endTime = new Date(startTime);
  endTime.setHours(24);

  const timeInterval = 900000; //15 Minutes in Milliseconds.
  
  let times = [];
  let timeDifference = endTime.valueOf() - startTime.valueOf();


  for( let i = 0; i <= timeDifference; i += timeInterval ){
    times.push( new Date(startTime) );
    startTime.setMilliseconds(timeInterval);
  }

  return times;
}

export default App;
