import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import './App.css';

const pariclesOptions = {
	particles: {
		number: {
			value: 30,
			density: {
				enable: true,
				value_area: 450
			}
		}
	}
}

const intialState = {
	input: '',
	imageUrl: '',
	boxes: [],
	route: 'signin',
	isSignedIn: false,
	user: {
		id: '',
		name: '',
		email: '',
		entries: 0,
		joined: ''
	}
}

class App extends Component {
	constructor() {
		super();
		this.state = intialState;
	}

	loadUser = (data) => {
		this.setState({
			user: {
				id: data.id,
				name: data.name,
				email: data.email,
				entries: data.entries,
				joined: data.joined
			}
		})
	}

	calculateFaceLocations = (data) => {
		return data.outputs[0].data.regions.map(face => {
			const clarifaiFace = face.region_info.bounding_box
			const image = document.getElementById('inputImage');
			const width = Number(image.width);
			const height = Number(image.height);
			return {
				leftCol: clarifaiFace.left_col * width,
				topRow: clarifaiFace.top_row * height,
				rightCol: width - (clarifaiFace.right_col * width),
				bottomRow: height - (clarifaiFace.bottom_row * height)
			}
		});
	}

	displayFaceBoxes = (boxes) => {
		this.setState({ boxes: boxes });
	}

	onInputChange = (event) => {
		this.setState({ input: event.target.value });
	}

	onPictureSubmit = () => {
		this.setState({ imageUrl: this.state.input });
		fetch('https://stark-journey-00498.herokuapp.com/imageurl', {
			method: 'post',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				input: this.state.input
			})
		})
			.then(response => response.json())
			.then(response => {
				if (response) {
					fetch('https://stark-journey-00498.herokuapp.com/image', {
						method: 'put',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							id: this.state.user.id
						})
					})
						.then(response => response.json())
						.then(count => {
							this.setState(Object.assign(this.state.user, { entries: count }));
						})
						.catch(console.log);
				}
				this.displayFaceBoxes(this.calculateFaceLocations(response));
			})
			.catch(err => console.log(err))
	}

	onRouteChange = (input) => {
		if (input === 'signout') {
			this.setState(intialState);
		} else if (input === 'home') {
			this.setState({ isSignedIn: true });
		}
		this.setState({ route: input });
	}

	render() {
		const { isSignedIn, imageUrl, route, boxes } = this.state;
		return (
			<div className="App" >
				<Particles className='particles' params={pariclesOptions} />
				<Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
				{ route === 'home'
					? <div>
						<Logo />
						<Rank name={this.state.user.name} entries={this.state.user.entries} />
						<ImageLinkForm onInputChange={this.onInputChange} onPictureSubmit={this.onPictureSubmit} />
						<FaceRecognition boxes={boxes} imageUrl={imageUrl} />
					</div>
					: (
						route === 'signin' || route === 'signout'
							? <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
							: <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
					)
				}
			</div>
		);
	}
}

export default App;
