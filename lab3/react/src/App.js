//import logo from './logo.svg';
import './App.css';
import React from "react";
import ipfsHttpClient from "ipfs-http-client";

const ipfs = ipfsHttpClient("https://ipfs.infura.io:5001");
console.log("ipfs:", ipfs);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      imgHash: ""
    };
  }
  componentDidMount = () => {
    this.setState({ loading: false });
  }
  handleSubmit = (event) => {
    event.stopPropagation();
    event.preventDefault();
    this.setState({ loading: true });

    const file = document.querySelector("#fileinput").files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = async () => {
      const fileBuffer = await Buffer.from(reader.result);
      const hash = await ipfs.add(fileBuffer, (err, ipfsHash) => {
        if (err) console.error(err);
        return ipfsHash;
      });
      console.log("hash:", hash);
      this.setState({
        loading: false,
        imgHash: hash.path
      });
      return fileBuffer;
    };
  };
  render = () => {
    return (
      <div className="App">
        <h2>IPFS INTERFACE</h2>
        <br></br>
        <form onSubmit={this.handleSubmit}>        
          <input id="fileinput" type="file" />
          <button type="submit">UPLOAD</button>
        </form>
        <p></p>
        {(this.state.loading || !this.state.imgHash) ? "There Are No Files Uploaded" : <>
          <img
              src={`https://ipfs.io/ipfs/${this.state.imgHash}`}
              height="400px"
          />
        </>}
      </div>
    );
  }
}
export default App;
