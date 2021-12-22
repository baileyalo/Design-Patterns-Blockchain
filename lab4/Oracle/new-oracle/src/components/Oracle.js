import { Component } from 'react'
import { STOCK_ORACLE_ABI, STOCK_ORACLE_ADDRESS } from "./quotecontract";
import Web3 from "web3"

const web3 = new Web3("http://localhost:8545") 
var accounts
var stockQuote

let deployContract = async () => {
    accounts = await web3.eth.getAccounts()
    console.log("Account 0 = ", accounts[0])

    stockQuote = new web3.eth.Contract(
        STOCK_ORACLE_ABI,
        STOCK_ORACLE_ADDRESS
    )
    console.log("Contract Address = " + stockQuote._address)
}
deployContract()

export default class Oracle extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            quote: "",
            symbol: "",
            open: "",
            high: "",
            low: "",
            price: "",
            volume: "",
            latestTradingDay: "",
            previousClose: "",
            change: "",
            changePercent: "",
            priceFromContract: "",
            volumeFromContract: ""
        }
    }   
    GetPrice = async () => {
        await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=6YX0B49YC4TOXARF`
        )
        .then((res) => res.json())
        .then((data) => {
            console.log(data);            
            this.setState({ 
                symbol: data["Global Quote"]["01. symbol"], 
                open: data["Global Quote"]["02. open"],
                high: data["Global Quote"]["03. high"],
                low: data["Global Quote"]["04. low"],
                price: data["Global Quote"]["05. price"],
                volume: data["Global Quote"]["06. volume"],
                latestTradingDay: data["Global Quote"]["07. latest trading day"],
                previousClose: data["Global Quote"]["08. previous close"],
                change: data["Global Quote"]["09. change"],
                changePercent: data["Global Quote"]["10. change percent"]
            })

            this.passDataToContract()

        })
        .catch(console.log)
    }  

    passDataToContract = async () => {
        console.log("symbol in hex: " + web3.utils.fromAscii(this.state.symbol))
        console.log("price: " + Math.round(parseInt(this.state.price)))
        console.log("volume: " + Math.round(parseInt(this.state.volume)))
        
        await stockQuote.methods
        .setStock(
            web3.utils.fromAscii(this.state.symbol), 
            web3.utils.toBN((parseInt(this.state.price))), 
            web3.utils.toBN((parseInt(this.state.volume)))
        )
        .send({from: accounts[0]}, (error, transactionHash) => {
            console.log("transactionHash: " + transactionHash)

        })
    }
    getDataFromContract = async () => {
        let price = await stockQuote.methods
        .getStockPrice(web3.utils.fromAscii("MSFT"))
        .call() 

        let volume = await stockQuote.methods
        .getStockVolume(web3.utils.fromAscii("MSFT"))
        .call() 

        this.setState({
            priceFromContract: price,
            volumeFromContract: volume
        })
    }
    render() {
        return (
            <div>
                <button onClick={this.GetPrice}>GET PRICE</button>

                <h3>SYMBOL:{this.state.symbol}</h3>
                <h3>OPEN:{this.state.open}</h3>
                <h3>HIGH:{this.state.high}</h3>
                <h3>LOW:{this.state.low}</h3>
                <h3>PRICE:{this.state.price}</h3>
                <h3>VOLUME:{this.state.volume}</h3>
                <h3>LATESTTRADINGDAY:{this.state.latestTradingDay}</h3>
                <h3>PREVIOUSCLOSE:{this.state.previousClose}</h3>
                <h3>CHANGE:{this.state.change}</h3>
                <h3>CHANGEPERCENTAGE:{this.state.changePercent}</h3>

                <button onClick={this.getDataFromContract}>GET DATA FROM CONTRACT</button>
                <h3>PRICE FROM CONTRACT:{this.state.priceFromContract}</h3>
                <h3>VOLUME FROM CONTRACT:{this.state.volumeFromContract}</h3>

            </div>
        )
    }
}


