import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import './App.css';

const app = new Clarifai.App({
	apiKey: 'c0c8f75ca388453d8904998e14174b97'
});

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

class App extends Component {
	constructor() {
		super();
		this.state = {
			input: '',
			imageUrl: '',
			box: {},
			route: 'signin',
			isSignedIn: false,
		}
	}

	calculateFaceLocation = (data) => {
		const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
		const image = document.getElementById('inputImage');
		const width = Number(image.width);
		const height = Number(image.height);
		console.log(width, height);
		return {
			leftCol: clarifaiFace.left_col * width,
			topRow: clarifaiFace.top_row * height,
			rightCol: width - (clarifaiFace.right_col * width),
			bottomRow: height - (clarifaiFace.bottom_row * height)
		}
	}

	displayFaceBox = (box) => {
		console.log(box);
		this.setState({ box: box });
	}

	onInputChange = (event) => {
		this.setState({ input: event.target.value });
	}

	onButtonSubmit = () => {
		this.setState({ imageUrl: this.state.input }, () => {
			app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.imageUrl)
				.then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
				.catch(err => console.log(err));
		});
	}

	onRouteChange = (input) => {
		if (input === 'signout') {
			this.setState({ isSignedIn: false })
		} else if (input === 'home') {
			this.setState({ isSignedIn: true })
		}
		this.setState({ route: input });
	}

	render() {
		const { isSignedIn, imageUrl, route, box } = this.state;
		return (
			<div className="App">
				<Particles className='particles' params={pariclesOptions} />
				<Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
				{ route === 'home'
					? <div>
						<Logo />
						<Rank />
						<ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
						<FaceRecognition box={box} imageUrl={imageUrl} />
					</div>
					: (
						route === 'signin' || route === 'signout'
							? <SignIn onRouteChange={this.onRouteChange} />
							: <Register onRouteChange={this.onRouteChange} />
					)
				}
			</div>
		);
	}
}

export default App;
