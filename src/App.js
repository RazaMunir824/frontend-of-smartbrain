import React, {Component} from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';


import Particles from 'react-particles-js';



const paramm = {
                particles: {
                  line_linked: {
                    shadow: {
                      enable: true,
                      color: "#3CA9D1",
                      blur: 5
                    }
                  }
                }
              }



const Initialstate = {
       input:'',
       imageUrl:'',
       box:{},
       route: 'signin',
       isSignedIn: false,
       user : {
          id:'',
          name:'',
          email:'',
          entries: 0,
          joined:''
        }
    }
class App extends Component {

  constructor(){
    super();
    this.state = Initialstate
  }
  

  loadUser = (data) => {
    this.setState({user : {
        id:data.id,
        name:data.name,
        email:data.email,
        entries: data.entries,
        joined:data.joined
      }
    })
  }
  //componentDidMount(){
    //fetch('http://localhost:3000')
     //.then(response => response.json())
     //.then(console.log)
  //}

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image= document.getElementById('inputimage')
    const height = Number(image.height)
    const width = Number(image.width)
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }
  
  displayFaceBox = (box) => {
    this.setState({box: box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonClick = () => {
    this.setState({imageUrl: this.state.input});
      fetch('http://localhost:3000/imageurl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })
      })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.text())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })

        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }


  

  

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(Initialstate)
    }else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route:route})
  }


  render(){
    return (
        <div className="App">
          <Particles className="particles" param={paramm} />

          <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn} />
          
          {
            this.state.route === "home"
            ? <div>
                <Logo />
                <Rank name={this.state.user.name} entries={this.state.user.entries} />
                <ImageLinkForm onInputChange={this.onInputChange} onButtonClick={this.onButtonClick} />
                <FaceRecognition imageUrl={this.state.imageUrl} box={this.state.box} />
              </div>
            :
            ( this.state.route === "signin"
              ? <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
              : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />

            ) 
          }
          
        </div>
    );
  }
      
}

export default App;
