<div align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="calculator.png" width="80" height="80">
  </a>

  <h3 align="center">Decimal-64 Floating Point Converter</h3>

  <p align="center">
    https://decimalftp-converter.herokuapp.com
  </p>
</div>

## About The Project

![image](https://user-images.githubusercontent.com/75743382/152960762-1efd9958-4eb5-4150-8e7c-8719ae92fd01.png)

The Decimal64 floating point format is a computer numbering format used if exact representation of decimals are required (e.g. bank transactions, tax computations). This converter would take a decimal value and its base-10 exponent, converting it into its binary and hexadecimal representation.

## How To Use

![image](https://user-images.githubusercontent.com/75743382/152960762-1efd9958-4eb5-4150-8e7c-8719ae92fd01.png)

1. Input the **significand** of the decimal value (`127` or `127.0` in 127.0x10<sup>5</sup>).
2. Input the **base-10 exponent** of the decimal value (`5` in 127.0x10<sup>5</sup>).
   - Invalid values are classified as NaN (Not a Number).
3. Select a rounding off method from the listed choices.

![image](https://user-images.githubusercontent.com/75743382/152964320-cdeeddab-15c9-4114-ba38-f1c48897e90e.png)

4. The binary and hexadecimal representations of the input will be listed.
5. Selecting the `Copy to Clipboard` option would copy either the binary (e.g. `0010011001001100101001110000000000`) or hexadecimal (`264C000000029C00`) representations to the clipboard.

### Built With

* [Node.js](https://nodejs.org/en/)
* [Handlebars](https://github.com/igorescobar/jQuery-Mask-Plugin)
* [Bootstrap](https://getbootstrap.com)
* [JQuery](https://jquery.com)
* [JQuery Mask Plugin](https://github.com/igorescobar/jQuery-Mask-Plugin)
