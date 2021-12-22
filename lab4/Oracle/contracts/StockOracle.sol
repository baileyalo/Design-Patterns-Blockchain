// SPDX-License-Identifier:MIT
pragma solidity ^0.8.6;

contract StockOracle {

    // quote structure
    struct stock {
        uint price;
        uint volume;
    }

    // quotes by symbol
    mapping(bytes4 => stock) stockQuote;

    // Contract owner
    address oracleOwner;


    // Set the value of a stock
    function setStock(bytes4 symbol, uint price, uint volume) public {
        stockQuote[symbol].price = price;
        stockQuote[symbol].volume = volume;

    }



    // Get the value of a stock
    function getStockPrice(bytes4 symbol) public view returns (uint) {
        return stockQuote[symbol].price;
    }


    // Get the value of volume traded for a stock
    function getStockVolume(bytes4 symbol) public view returns (uint) {
        return stockQuote[symbol].volume;
    }

}