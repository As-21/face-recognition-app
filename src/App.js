import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
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

	render() {
		return (
			<div className="App">
				<Particles className='particles' params={pariclesOptions} />
				<Navigation />
				<Logo />
				<Rank />
				<ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
				<FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
			</div>
		);
	}
}

export default App;
